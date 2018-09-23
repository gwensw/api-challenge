{
  const searchTerms = ['brass', 'iron', 'wood', 'copper', 'fur', 'boat', 'clay', 'brick', 'wicker', 'electric', 'paper', 'book', 'photo', 'draw', 'lead', 'print', 'earth', 'plastic'];

  function randomFrom(arr) {
    return Math.floor(Math.random() * arr.length);
  }

  async function searchCollection(term) {
    const data = await fetch(`https://data.nma.gov.au/object?limit=100&format=simple&title=${term}`);
    return data.json();
  }

  function getImageLink(object) {
    const { hasVersion } = object.hasVersion[0];
    const identifiers = {
      'thumbnail image': [],
      'large image': []
    };
    // loop through the versions to find the biggest image
    for (let i = 0; i < hasVersion.length; i += 1) {
      const { version } = hasVersion[i];
      if (version === 'preview image') return hasVersion[i].identifier; // if 'large image', return that
      identifiers[version].push(hasVersion[i].identifier); // make a list of other images
    }
    if (identifiers['large image'].length) return identifiers['large image'][0];
    return identifiers['thumbnail image'][0];
  }

  function chooseObject(objects) {
    // loop through the objects until you find one with a 'hasVersion'
    while (objects.length) {
      const i = randomFrom(objects);
      const object = objects[i];
      if (object.hasVersion && object.hasVersion[0].hasVersion[0].type === 'StillImage') {
        return {
          id: object.id,
          title: object.title,
          description: object.physicalDescription,
          imageLink: getImageLink(object)
        };
      }
      objects.splice(i, 1);
    }
    throw new Error('no objects with images found');
  }

  function renderOutlink(id) {
    const url = `http://collectionsearch.nma.gov.au/object/${id}`;
    document.getElementById('outlink').href = url;
    document.getElementById('outlink').textContent = 'view this in the museum collection';
  }

  function renderText(id, text) {
    document.getElementById(id).textContent = text;
  }

  function showHideObject() {
    document.querySelector('.object').classList.toggle('object--loading');
  }

  function renderImage(imageLink) {
    return new Promise((resolve) => {
      const image = document.getElementById('image');
      // TODO: display a loader graphic
      // preload the image on a temporary element
      const downloader = new Image();
      downloader.onload = () => {
        showHideObject();
        document.getElementById('imageloader').classList.remove('loader--loading');
        image.src = imageLink; // display the preloaded image
        downloader.remove(); // delete the temp image
        resolve();
      };
      document.getElementById('dataloader').classList.remove('loader--loading');
      document.getElementById('imageloader').classList.add('loader--loading');
      downloader.src = imageLink; // start the download
    });
  }

  async function init(term) {
    // hide the object
    showHideObject();
    document.getElementById('dataloader').classList.add('loader--loading');
    // choose a random term
    const termToSearch = term || searchTerms[randomFrom(searchTerms)];
    // get the collection data
    const data = await searchCollection(termToSearch);
    // pick a random item from the array
    const object = chooseObject(data.data);
    // deconstruct the array into id, title, description, imageLink
    const { id, title, description, imageLink } = object;
    // call other functions which render the different elements onto the page
    renderImage(imageLink)
      .then(() => {
        renderOutlink(id);
        renderText('title', title);
        renderText('description', description);
      });
  }

  document.getElementById('searchers').addEventListener('click', (e) => {
    const { term } = e.target.dataset;
    if (term === 'random') {
      init();
    } else {
      init(term);
    }
  });

  init();
}
