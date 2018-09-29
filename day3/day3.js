{
  function updateLatLong(lat, long) {
    document.getElementById('lat').textContent = lat;
    document.getElementById('long').textContent = long;
  }

  function updateLocation(message) {
    document.getElementById('location').innerHTML = message;
  }

  function updateImage(imageSrc) {
    const image = document.getElementById('banner');
    image.src = imageSrc;
    document.getElementById('iss').classList.add('img--hidden');
    image.classList.remove('img--hidden');
  }

  function render(lat, long, location, imageSrc) {
    if (imageSrc) updateImage(imageSrc);
    updateLatLong(lat, long);
    updateLocation(`The ISS is over <span class='bold'>${location}</span> right now`);
  }

  function showErrorMessage() {
    // TODO: render an animated 'searching...' graphic on screen
    updateLocation('searching for the ISS...');
    document.getElementById('iss').classList.remove('img--hidden');
  }

  function showOceanMessage(lat, long) {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${long}`;
    const message = `<a href='${url}' target='_blank'>an ocean</a>`;
    render(lat, long, message, './ocean.png');
  }

  async function getISSCoordinates() {
    const data = await fetch('https://cors-anywhere.herokuapp.com/http://api.open-notify.org/iss-now.json');
    const parsedData = await data.json();
    const coords = parsedData.iss_position;
    return coords;
  }

  async function reverseGeocode(lat, long) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}%20${long}&key=71e19d79711d41e48bb492fc874074d0&language=en&no_annotations=1&language=en`;
    const data = await fetch(url);
    const { results, status } = await data.json();
    if (status.code === 200 && !results.length) {
      showOceanMessage(lat, long);
      throw new Error('ocean');
    }
    return results[0];
  }

  async function getBanner(countryCode) {
    return new Promise((resolve) => {
      const src = `https://www.countryflags.io/${countryCode}/flat/64.png`;
      // create a throwaway image
      const downloadingImage = new Image();
      // handle eventual download of image source
      downloadingImage.onload = () => {
        resolve(src);
      };
      // start downloading image source
      downloadingImage.src = src;
    });
  }

  async function findISS() {
    try {
      const coords = await getISSCoordinates();
      const { components, formatted } = await reverseGeocode(coords.latitude, coords.longitude);
      const bannerSrc = await getBanner(components.country_code);
      render(coords.latitude, coords.longitude, formatted, bannerSrc);
    } catch (error) {
      if (error.message !== 'ocean') {
        showErrorMessage();
        console.error(error);
      }
    }
    // recursion - keep searching!
    setTimeout(findISS, 6000);
  }

  findISS();
}
