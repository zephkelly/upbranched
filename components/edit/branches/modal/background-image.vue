<template>
<section class="modal" ref="modal" @mousemove="drag" @mouseup="endDrag()" @mouseleave="endDrag()">
  <div class="panel">
    <div class="info">
      <h3>Background Image</h3>
      <button class="close-button" @click="shouldClose()">
        <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/></svg>
      </button>
    </div>
    <div class="content">
      <div class="preview">
        <label for="previewImage">Preview</label>
        <div class="container" ref="previewContainer" @mousedown="startDrag($event)" @mouseup="endDrag()" @contextmenu="preventContextMenu($event)">
          <img id="previewImage" ref="previewImage" :src="branchData.branch.background_image"/>
        </div>
      </div>
      <div class="navbar">
        <nav>
          <ul>
            <li>
              <button class="active" ref="uploadPageButton">Upload image</button>
            </li>
            <!-- <li>
              <button @click="enableLinkPage()" ref="linkPageButton">Paste Link</button>
            </li> -->
          </ul>
        </nav>
      </div>
      <div class="sub-pages">
        <Transition name="fade">
          <div v-show="openUploadPage" class="upload-option">
            <!-- <label for="background-image">Upload Image</label> -->
            <div class="upload">
              <label for="backgroundImage" ref="uploadImageLabel">Click or drag an image here</label>
              <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M220 896q-24 0-42-18t-18-42V693h60v143h520V693h60v143q0 24-18 42t-42 18H220Zm230-153V372L330 492l-43-43 193-193 193 193-43 43-120-120v371h-60Z"/></svg>
              <input type="file" id="backgroundImage" ref="backgroundImage" name="background-image" accept="image/*" @change="handleFileUpload()">
            </div>
          </div>
        </Transition>
        <Transition name="fade">
          <div v-show="openLinkPage" class="link-option">
          </div>
        </Transition>
      </div>
      <div class="field submit">
            <p class="message" v-show="!branchSubmitError">{{ branchSubmitMessage }}</p>
            <button class="save disabled" ref="submitBackgroundButton" @click="submitBackgroundButtonImage">
                <h3 v-show="!branchLoadingIndicator">Submit</h3>
                <svg v-show="branchLoadingIndicator" xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 96 960 960" width="48"><path d="M196 725q-20-36-28-72.5t-8-74.5q0-131 94.5-225.5T480 258h43l-80-80 39-39 149 149-149 149-40-40 79-79h-41q-107 0-183.5 76.5T220 578q0 29 5.5 55t13.5 49l-43 43Zm280 291L327 867l149-149 39 39-80 80h45q107 0 183.5-76.5T740 577q0-29-5-55t-15-49l43-43q20 36 28.5 72.5T800 577q0 131-94.5 225.5T480 897h-45l80 80-39 39Z"/></svg>
            </button>
      </div>
    </div>
  </div>
</section>
</template>

<script setup lang="ts">
const props = defineProps(['branchData']);

const modal: Ref = ref(null);

// --------------- Sub pages ------------------
const openUploadPage: Ref = ref(true);
const openLinkPage: Ref = ref(false);
const uploadPageButton: Ref = ref(null);
function enableUploadPage() {
  disablePages();
  
  openUploadPage.value = true;
  uploadPageButton.value.classList.add('active');
}

const linkPageButton: Ref = ref(null);
function enableLinkPage() {
  disablePages();

  openLinkPage.value = true;
  linkPageButton.value.classList.add('active');
}

function disablePages() {
  openUploadPage.value = false;
  openLinkPage.value = false;

  uploadPageButton.value.classList.remove('active');
  linkPageButton.value.classList.remove('active');
}

// -------------- Show Preview ------------------
const backgroundImage: Ref = ref(null);
const previewImage: Ref = ref(null);

const previewImageFile: Ref = ref(null);

//File upload
const uploadImageLabel: Ref = ref(null);
function handleFileUpload() {
  previewImageFile.value = backgroundImage.value.files;
  
  if (previewImageFile.value[0].size > 5242880) {
    alert('File size is too big! Can not be more than 5MB');
    canSave.value = false;
    return;
  }

  if (previewImageFile.value) {
    previewImage.value.src = URL.createObjectURL(previewImageFile.value[0]);
    uploadImageLabel.value.innerHTML = previewImageFile.value[0].name;
    
    canSave.value = true;
  }
}

// --------- Reposition Preview ----------
let isDraggingPreview: Ref = ref(false);
let dragOffsetY = 0;

function startDrag(event: any) {
  isDraggingPreview.value = true;
  dragOffsetY = event.clientY - previewImage.value.offsetTop;
}

const previewContainer: Ref = ref(null);
function drag(event: any) {
  if (!isDraggingPreview.value) return;

  event.preventDefault();

  const y = event.clientY - dragOffsetY;
  const maxY = (previewImage.value.clientHeight - previewContainer.value.clientHeight);

  previewImage.value.style.top = `-${Math.min(Math.max(-y, 0), maxY)}px`;
};

function endDrag() {
  isDraggingPreview.value = false;
}

function preventContextMenu(event: any) {
  event.preventDefault();
}

// --------------- Submit ------------------
const branchSubmitError: Ref = ref(false);
const branchSubmitMessage: Ref = ref('');
const branchLoadingIndicator: Ref = ref(false);

// --------------- Save ------------------
const submitBackgroundButton: Ref = ref(null);
const canSave: Ref = ref(false);
watch(canSave, (value) => {
  if (value) {
    submitBackgroundButton.value.classList.remove('disabled');
  } else {
    submitBackgroundButton.value.classList.add('disabled');
  }
});

function submitBackgroundButtonImage() {
  if (!canSave.value) return;

  const formData = new FormData();
  formData.append('photo', previewImageFile.value[0]);
  formData.append('top', previewImage.value.style.top);
  formData.append('branch', props.branchData.branch.id);
  formData.append('background_image', props.branchData.branch.background_image);

  useFetch('/api/branches/upload/background/', {
    method: 'POST',
    body: formData
  }).then((response) => {
    if (response.status.value === 'success') {
        branchSubmitError.value = false;
        branchSubmitMessage.value = 'Background image saved successfully...';

        branchLoadingIndicator.value = true;
        submitBackgroundButton.value?.classList.add('disabled');

        setTimeout(() => {
            branchSubmitMessage.value = '';
            branchSubmitError.value = false;
            branchLoadingIndicator.value = false;
            backgroundImageModalEnabled().value = false;
      }, 3000);
    }
    else {
        branchSubmitError.value = true;
        branchSubmitMessage.value = response.error;

        branchLoadingIndicator.value = false;
        submitBackgroundButton.value?.classList.remove('disabled');
    }
  });
}

// --------------- Close modal ------------------
function shouldClose() {
  backgroundImageModalEnabled().value = false
}

onMounted(() => {
  modal.value.classList.add('active');
});
</script>


<style lang="scss" scoped>
.modal {
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  top: 0;
  left: 0;
  overflow-y: scroll;

  &.active {
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);

    .panel {
      opacity: 1;
    }
  }

  @media screen and (max-height: 890px) {
    align-items: flex-start;

    .panel {
      margin-top: 6rem;
      margin-bottom: 6rem;
    }
  }
}

.panel {
  position: relative;
  background-color: var(--panel-color);
  border: 1px solid var(--panel-border-color);
  border-radius: 0.5rem;
  padding: 2rem;
  width: 700px;
  font-family: 'Roboto', sans-serif;
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }

  .close-button {
    background-color: transparent;
    position: relative;

    svg {
      position: relative;
      left: 0.4rem;
      width: 2rem;
      height: 2rem;
      fill: var(--text-color);
    }
  }

  .info {
    display: grid;
    grid-template-columns: 1fr 2rem;
    margin-bottom: 2rem;
    
    h3 {
      user-select: none;
      font-size: 1.5rem;
      font-weight: 500;
    }
    
    label {
      user-select: none;
    }
  }
}

.content {
  display: flex;
  flex-direction: column;

  .preview {
    grid-column: 1 / 3;
    min-height: 11.5rem;

    label {
      user-select: none;
    }

    .container {
      position: relative;
      width: 100%;
      height: auto;
      min-height: 8.2rem;
      max-height: 8.2rem;
      margin-top: 0.35em;
      border-radius: 0.2rem;
      overflow: hidden;
      border: 1px solid var(--panel-border-color);
      border-top: none;
      
      img {
        position: absolute;
        border-top: 1px solid var(--panel-border-color);
        border-bottom: 1px solid var(--panel-border-color);
        border-radius: 0.2rem;
        pointer-events: none;
        user-select: none;
        width: 100%;
        max-height: 1200px;
        object-fit: cover;
        top: 0rem;
      }
    }
  }

  .navbar {
    position: relative;
    margin-top: 2rem;
    top: 0.5px;
    z-index: 10;

    nav {
      ul {
        display: flex;
        list-style: none;

        li {
          button {
            width: 100%;
            height: 100%;
            font-size: 1rem;
            color: var(--text-color-darker);
            background-color: var(--panel-color);
            border: 1px solid var(--panel-border-color);
            padding: 0.8rem 1rem;
            transition: background-color 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);

            &.active {
              background-color: var(--background-color);
              border-bottom: none;
            }

            &:hover {
              background-color: var(--background-color);
            }
          }

          &:nth-child(2) {
            button {
              border-left: none;
              // border-right: none;
            }
          }
        }
      }
    }
  }

  .sub-pages {
    position: relative;
    height: 14rem;
    background-color: var(--background-color);
    border-radius: 0rem 0.5rem 0.5rem 0.5rem;
    overflow: hidden;
    border: 1px solid var(--panel-border-color);
  }

  .upload-option {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    display: flex;
    flex-direction: column;

    .upload {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: var(--background-color);

      input {
        opacity: 0;
        width: 100%;
        height: 100%;
        border: none;
        cursor: pointer;
      }

      label {
        top: 4.5rem;
        position: absolute;
        font-size: 1.2rem;
        font-weight: 500;
        color: var(--text-color);
        pointer-events: none;
        opacity: 0.6;
      }

      svg {
        bottom: 4.5rem;
        position: absolute;
        width: 2.5rem;
        height: 2.5rem;
        fill: var(--text-color);
        pointer-events: none;
        opacity: 0.6;
      }
    }
  }

  .field.submit {
    margin-top: 2rem;
    height: 3rem;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    .message {
      color: var(--accent-color-text);
      font-size: 0.9rem;
      opacity: 1;
      width: 18rem;
    }

    button {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 1rem;
        width: 6rem;
        height: 2.5rem;
        font-size: 1rem;

        h3 {
            position: absolute;
            color: var(--text-color-dark);
        }

        svg {
            position: absolute;
            height: 1.6rem;
            width: 1.6rem;
            fill: var(--text-color-dark);
            animation: spin 1.5s linear infinite;

            @keyframes spin {
                100% {
                transform: rotate(360deg);
                }
            }
        }
    }
  }
}
</style>