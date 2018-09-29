function randomGif(tag) {
  fetch(`https://api.giphy.com/v1/gifs/random?tag=${tag}&rating=G&api_key=6zhKqvUGeYCpwndY2geuy4cEe0g7dRRv`)
    .then(res => res.json())
    .then((res) => {
      document.getElementById('gif').src = res.data.images.fixed_height.url;
    })
    .catch((err) => {
      // TODO: render a sad message on the screen
      console.log(err);
    });
}

['click', 'keydown'].forEach((event) => {
  document.addEventListener(event, (e) => {
    const el = e.target;
    if (el.classList.contains('controller__button')) {
      randomGif(el.dataset.tag);
      Array.from(document.querySelectorAll('.controller__button--selected'))
        .forEach(button => button.classList.remove('controller__button--selected'));
      el.classList.add('controller__button--selected');
    }
  });
});
