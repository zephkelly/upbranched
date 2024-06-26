<template>
  <div class="overflow" ref="overflowY" @mousemove="drag" @mouseup="endDrag()" @mouseleave="endDrag()">
    <section class="posts-feed" :style="`top: clamp(0px, ${posY + 'px'}, ${smoothDamp(posY)}px); left: clamp(-${leftLimit}px, ${posX + 'px'}, ${leftLimit - 8}px)`">
      <div class="draggable"
        @mousedown="startDrag"
        @mouseup="endDrag()">
        <ControlBar :currentPage="'index'" />
      </div>
      <CreatePanel />
      <div class="post-container" ref="postsContainer">
        <div v-if="pending" class="posts-pending">
          <p style="margin-top: 3rem;">Loading</p>
        </div>
        <div v-else class="posts-loaded">
          <section class="posts">
            <div class="fade"></div>
            <PostsPost class="text" />
            <PostsPost2 class="text rising"/>
            <PostsPost class="media" />
            <PostsPost class="media rising" />
          </section>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
const { pending, data: posts } = useLazyFetch('/api/posts')
watch(posts, (newPosts) => {
  // Because posts starts out null, you will not have access
  // to its contents immediately, but you can watch it.
})

const overflowY: Ref = ref(null)
const postsContainer: Ref = ref(null)
watch(isCreatingIndex, (newIsCreating) => {
  if (newIsCreating.value === true) {
    postsContainer.value.classList.add('creating');
    overflowY.value.style.height = 'calc(100vh + 0.5rem)';
  } else {
    postsContainer.value.classList.remove('creating');
    overflowY.value.style.height = '100%';
  }
})

// Make post component draggable
const posX = ref(0);
const posY = ref(0);
let lastX = 0;
let lastY = 0;

let browserWidth = 0;
let postFeedWidth = 0;
const leftLimit = ref(0);

function startDrag(event: any) {
  event.preventDefault();

  isDraggingControlBarIndex().value = true;

  browserWidth = document.body.clientWidth;
  postFeedWidth = postsContainer.value.clientWidth;

  lastX = event.clientX;
  lastY = event.clientY;
};

function drag(event: any) {
  if (!isDraggingControlBarIndex().value) return;

  leftLimit.value = ((browserWidth - postFeedWidth) - 50) / 2;

  const deltaX = event.clientX - lastX;
  const deltaY = event.clientY - lastY;

  lastX = event.clientX;
  lastY = event.clientY;

  posX.value += deltaX;
  posY.value += deltaY;
};

function endDrag() {
  dockPostFeed();

  isDraggingControlBarIndex().value = false;
}

function dockPostFeed() {
  const browserWidth = document.body.clientWidth;
  const zoneWidth = browserWidth / 3;
  const zoneThreshold = zoneWidth / 2;

  if (browserWidth > 1000) {
    indexPostCurrentAvailableZones().value = 'three';
    tripleZoneDock(zoneThreshold);
  }
  // else if (browserWidth > 1000) {
  //   indexPostCurrentAvailableZones().value = 'twoZones';
  //   doubleZoneDock(zoneThreshold);
  // }
  else {
    indexPostCurrentAvailableZones().value = 'one';
    singleZoneDock();
  }

  posY.value = 0;
}

function tripleZoneDock(zoneThreshold: number) {
  if (posX.value <= -leftLimit.value + zoneThreshold) {
    posX.value = -leftLimit.value;
    controlBarPostitionIndex().value = 'left';
  }
  else if (posX.value >= leftLimit.value - zoneThreshold) {
    posX.value = leftLimit.value;
    controlBarPostitionIndex().value = 'right';
  }
  else {
    posX.value = 0;
    controlBarPostitionIndex().value = 'middle';
  }
}

function doubleZoneDock(zoneThreshold: number) {
  if (posX.value <= -leftLimit.value + zoneThreshold) {
    posX.value = -leftLimit.value;
    controlBarPostitionIndex().value = 'left';
  }
  else {
    posX.value = leftLimit.value;
    controlBarPostitionIndex().value = 'right';
  }
}

function singleZoneDock() {
  posX.value = 0;
  controlBarPostitionIndex().value = 'middle';
}

function smoothDamp(t: number, L = 200, k = 0.009, x0 = 199) {
  return L / (1 + Math.exp(-k * (t - x0)));
}

onBeforeMount(() => {
  browserWidth = document.body.clientWidth;
  leftLimit.value = ((browserWidth - 600) - 50) / 2;

  if (controlBarPostitionIndex().value === 'left') {
    posX.value = -leftLimit.value;
  }
  else if (controlBarPostitionIndex().value === 'right') {
    posX.value = leftLimit.value;
  }
  else {
    posX.value = 0;
  }
  
  dockPostFeed();
})

onMounted(() => {
    isCreatingIndex().value = false;

  if (postsContainer.value !== null) {
    window.addEventListener('resize', () => {
      browserWidth = document.body.clientWidth;
      if (postsContainer.value === null) return;
      leftLimit.value = ((browserWidth - postsContainer.value.clientWidth) - 50) / 2;
    
      dockPostFeed();
    })
  }
})

onBeforeUnmount(() => {
  isCreatingIndex().value = false;
});

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    browserWidth = document.body.clientWidth;
    leftLimit.value = ((browserWidth - postsContainer.value.clientWidth) - 50) / 2;

    dockPostFeed();
  })
})
</script>

<style lang="scss" scoped>
.overflow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  min-height: 680px;
  overflow-y: hidden;
}

section.posts-feed {
  position: relative;
  width: 600px;
  margin-top: 3rem;
  margin-bottom: 6rem;
  box-sizing: border-box;
  transition: left 0.15s cubic-bezier(0.075, 0.82, 0.165, 1), top 0.15s cubic-bezier(0.075, 0.82, 0.165, 1);
}

.posts-loaded {
  width: 100%;
  height: 100%;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .posts {
    transition: transform 0.15s cubic-bezier(0.075, 0.82, 0.165, 1) 0.2s;

    .fade {
      z-index: -100;
      top: 0rem;
      left: -1.8rem;
      position: absolute;
      width: 110%;
      height: 80rem;
      background: linear-gradient(0deg, rgba(255,255,255,0) 0%, var(--background-color) 100%);
      opacity: 0;
      transition: opacity 1s cubic-bezier(0.075, 0.82, 0.165, 1) 0.25s;
    }
  }
}

.post-container.creating {
  .posts {
    transform: translateY(36rem);
    transition: transform 0.15s cubic-bezier(0.075, 0.82, 0.165, 1);
    
    .fade {
      z-index: 10;
      opacity: 1;   
    }
  }
}

.draggable {
  position: relative;
  z-index: 12;
}
</style>