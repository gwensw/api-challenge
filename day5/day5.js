/* eslint-disable func-names */

{
  // all the unsplash search options are stored here, to be randomly selected later
  const searchTerms = {
    person: {
      fantasy: [
        'collection/2704809', // fairies-mermaids-elementals
        // 'featured/?man,costume',
        // 'featured/?woman,costume'
      ],
      scifi: [
        // 'collection/2712139', // story
        // 'collection/1655018', // astronaut
        'collection/1432050', // futurechange-people
        // 'random/?robot',
        // 'random/?neon,person'

      ],
      contemporary: [
        'collection/895539', // faces
        'collection/138794', // portraits
        'collection/472913', // diverse-women
        'collection/628604', // diverse-men
        'collection/1355639', // ladies
        'collection/1109504', // men
        'collection/1001039' // people
      ]
    },
    place: {
      fantasy: [
        'collection/1653915', // fantasy-world
        'collection/397119', // mysterious-landscapes
        'collection/407154', // historically-inspired
        'collection/2713683', // ancient-world
        'collection/139420' // beautiful-forests
      ],
      scifi: [
        'collection/2250830', // spaceplanets
        'collection/1284184', // sci-fi-city
        'collection/570690', // sci-fi-vibes
        'collection/236531', // space-sky
        'collection/994668', // post-apocalyptic
        'collection/1025438' // post-apocalyptic-and-broken-worlds
      ],
      contemporary: [
        'featured/?landscape',
        'collection/138724', // buildings-and-towns
        'collection/1055009', // locations
        'collection/1976082', // striking-city-views
        'collection/932809', // inspiring-views-no-people
        'collection/139420' // beautiful-forests
      ]
    },
    thing: {
      fantasy: [
        'collection/1001994', // herbal-magic
        'collection/875121', // fairy-tales-and-castles
        'collection/1013/magic', // magic
        'collection/2501486', // fantasy-aesthetic
        'collection/764272', // magic-wizards-wizard-witch-witches-wands-broomsticks
        // 'random/?renaissance',
        // 'random/?medieval',
        'collection/2279294' // it-belongs-in-a-museum
      ],
      scifi: [
        'collection/2566849', // science-oer
        'collection/1255530', // tools-and-equipment
        'collection/972750', // future-tech
        'collection/1158348', // science-fiction
        'collection/261936', // technology
        'collection/2143557', // technology
        'collection/972750', // future-tech
        'collection/1346463' // the-future
      ],
      contemporary: [
        'collection/1255530', // tools-and-equipment
        'collection/177168', // objects-of-interest
        'collection/985158', // objects
        'collection/168922', // vintage
        'collection/2024131', // items-and-animals
        'collection/190801' // random-items
      ]
    }
  };

  function randomFrom(arr) {
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
  }

  function getSearchTerms(categoryTypes, genre = false) {
    return categoryTypes.map((catType) => {
      if (genre) {
        const returnval = randomFrom(searchTerms[catType][genre]);
        return returnval;
      }
      // merge all the arrays in the category type
      // TODO: try re-doing this with reduce
      let allGenres = [];
      const keys = Object.keys(searchTerms[catType]);
      for (let i = 0; i < keys.length; i += 1) {
        allGenres = allGenres.concat(searchTerms[catType][keys[i]]);
      }
      // then pick a random search term from the combined array
      const returnval = randomFrom(allGenres);
      return returnval;
    });
  }

  function applyBlurs() {
    const blurEls = Array.from(document.querySelectorAll('.image__blurrer'));
    for (let i = 0; i < blurEls.length; i += 1) {
      blurEls[i].classList.add('blur');
    }
  }

  function loadImage(category, url) {
    const targetImage = document.getElementById(category);
    const targetBlur = document.getElementById(`${category}-blur`);
    // handler on temp image will update the real image once download completes
    const downloader = new Image();
    downloader.onload = function () {
      targetImage.src = this.src; // display the preloaded image
      targetBlur.classList.remove('blur'); // start the transition out of blur
      downloader.remove(); // delete the temp image
    };
    downloader.src = url; // start the download
  }

  function makePromise(searchTerm) {
    // add random number to the end to avoid caching
    return fetch(`https://source.unsplash.com/${searchTerm}?sig=${Math.random() * 1000}`);
  }

  function getImages(genre = false) {
    const errorMessage = document.getElementById('error');
    applyBlurs(); // reapply the blurs to everything
    const categoryTypes = ['person', 'place', 'thing', 'person'];
    const categories = ['character', 'location1', 'object', 'antagonist'];
    // create a promise for each category
    const imagePromises = getSearchTerms(categoryTypes, genre)
      .map(id => makePromise(id));
    // when the promises resolve, start loading the images on the page
    Promise.all(imagePromises)
      .then((responses) => {
        categories.forEach((category, i) => {
          loadImage(category, responses[i].url);
        });
        errorMessage.classList.add('hide'); // make sure error is hidden
      })
      .catch((err) => {
        errorMessage.classList.remove('hide'); // show error message
        console.error(err);
        setTimeout(getImages, 5000);
      });
  }

  getImages();

  document.getElementById('clicker').addEventListener('click', () => {
    getImages();
  });
}
