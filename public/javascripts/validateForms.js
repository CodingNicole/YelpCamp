(function () {
  'use strict';

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.validated-form');

  // Loop over them and prevent submission
  Array.from(forms).forEach(function (form) {
    form.addEventListener(
      'submit',
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        // const images = document.querySelector('#image');
        // if (images.files.length > 2) {
        //   console.log('too many files');
        //   images.classList.add('is-invalid');
        // }
        // for (let file of images.files) {
        //   if (file.size > 1000 * 1000 * 5) {
        //     console.log('file is too big');
        //   }
        // }

        form.classList.add('was-validated');
      },
      false
    );
  });
})();
