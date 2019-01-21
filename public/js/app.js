// Hide Error Messages After 3 seconds
[...document.querySelectorAll('.alert')].map(element => {
  setTimeout(() => {
    element.style.display = 'none';
  }, 3000);
});

// Read Images as Binary
function onSelectFile(ref, imageRef){
  [...ref].map(ref => {
    [...imageRef].map(image => {
      ref.addEventListener('change', function(e){
        const files = e.target.files;
        let imageUrl = '';
        const fileReader = new FileReader();
        fileReader.addEventListener('load', function(){
          imageUrl = this.result;
          image.src = imageUrl;
        });
        fileReader.readAsDataURL(files[0]);
      });
    });
  });
}
const images = document.querySelectorAll('.post-thumbnail-image');
const refs = document.querySelectorAll('.post-thumbnail-input');
onSelectFile(refs, images);

// Remove Preloader After Everything is loaded
function removePreloader(){
  window.addEventListener('load', () => {
    const preloader = document.querySelector('.preloader');
    document.body.removeChild(preloader);
  });
}

removePreloader();