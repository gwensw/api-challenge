/* global towns, Chartist */

{
  const town1 = document.getElementById('town1');
  const town2 = document.getElementById('town2');
  const cachedSeries = {};
  let cachedCategories;
  let crimeCategoryChart;

  function randomTown(el) {
    el.value = towns[Math.floor(Math.random() * towns.length)];
    // create and dispatch event
    const event = new MouseEvent('change', { bubbles: true });
    el.dispatchEvent(event);
  }

  function populateTownLists() {
    for (let i = 0; i < towns.length; i += 1) {
      const town = towns[i];
      town1.options[town1.options.length] = new Option(town, town);
      town2.options[town2.options.length] = new Option(town, town);
    }
    // remove the dummy option
    town1.options[0].remove();
    town2.options[0].remove();
  }

  function initCharts() {
    crimeCategoryChart = new Chartist.Bar('#crimeCategories', {}, {
      seriesBarDistance: 10,
      reverseData: true,
      horizontalBars: true,
      axisX: { onlyInteger: true },
      axisY: { offset: 110 }
    });
  }

  function showLoadingMessages(id, town) {
    document.getElementById(`${id}-title`).textContent = `Loading data for ${town}...`;
    document.getElementById(`${id}-force`).textContent = ' ';
    document.getElementById(`${id}-details`).innerHTML = '<p>Loading description...</p>';
  }

  function showTownError(id, town) {
    document.getElementById(`${id}-title`).textContent = `Sorry, there's no data available for ${town}...`;
    document.getElementById(`${id}-details`).innerHTML = '';
  }

  async function getCrimeCategories() {
    const data = await fetch('https://data.police.uk/api/crime-categories');
    return data.json();
  }

  async function getCoordinates(town) {
    const url = 'https://nominatim.openstreetmap.org/search/';
    const query = `?q=${town}&countrycodes=gb&format=json&accept-language=en`;
    const data = await fetch(url + query);
    const parsedData = await data.json();
    return parsedData[0];
  }

  function updateForceDetails(id, details) {
    document
      .getElementById(`${id}-force`)
      .textContent = details.name;
    document
      .getElementById(`${id}-details`)
      .innerHTML = details.description || '<p>No extra information available about this police force.</p>';
  }

  async function updateChart(id, town, crimeData = [], placeholder = false) {
    // update the town series in the crimeCategories chart
    if (!cachedCategories) {
      cachedCategories = await getCrimeCategories();
      const iToRemove = cachedCategories.findIndex(el => el.url === 'all-crime');
      cachedCategories.splice(iToRemove, iToRemove + 1);
    }
    const categories = cachedCategories
      .reduce((obj, item) => {
        obj[item.url] = 0;
        return obj;
      }, {});

    // count number of crimes in each category
    for (let i = 0; i < crimeData.length; i += 1) {
      const cat = crimeData[i].category;
      categories[cat] += 1;
    }
    const series = [];
    // plot alongside any pre-existing data
    cachedSeries[id] = Object.values(categories);
    series.push(cachedSeries[id]);
    if (id === 'town1' && cachedSeries.town2) {
      series.push(cachedSeries.town2);
    } else if (id === 'town2' && cachedSeries.town1) {
      series.unshift(cachedSeries.town1);
    }
    const labels = Object
      .keys(categories)
      .map(url => cachedCategories.find(item => item.url === url).name);
    // update the chart
    crimeCategoryChart.update({ labels, series });
    // render the town's name and total crimes
    if (!placeholder) {
      document.getElementById(`${id}-title`).textContent = `${town}: ${crimeData.length} total crimes`;
    }
  }

  async function updateData(town, id) {
    try {
      // put up a loading sign
      showLoadingMessages(id, town);
      // render an empty data series as placeholder
      updateChart(id, town, [], true);
      // First use town name to get coordinates
      const { lat, lon } = await getCoordinates(town);
      // Then save two promises
      const url = 'https://data.police.uk/api/';
      const crimePromise = fetch(`${url}crimes-street/all-crime?lat=${lat}&lng=${lon}`);
      const forcePromise = fetch(`${url}locate-neighbourhood?q=${lat},${lon}`);

      crimePromise
        .then(data => data.json())
        .then(data => updateChart(id, town, data))
        .catch((error) => {
          console.error(`Crime data for ${town} not found: ${error}`);
          showTownError(id, town);
        });

      forcePromise
        .then(data => data.json())
        .then(res => fetch(`${url}forces/${res.force}`))
        .then(data => data.json())
        .then(details => updateForceDetails(id, details))
        .catch((error) => {
          console.error(`Local force details for ${town} not found: ${error}`);
          showTownError(id, town);
        });
    } catch (err) {
      showTownError(id, town);
    }
  }

  // bind event listeners
  document.addEventListener('DOMContentLoaded', () => {
    populateTownLists();
    initCharts();
    const event = new MouseEvent('click', { bubbles: true });
    document.getElementById('randomise').dispatchEvent(event);
  });
  document.getElementById('main').addEventListener('change', (e) => {
    const town = e.target.value;
    const { id } = e.target;
    updateData(town, id);
  });
  document.getElementById('randomise').addEventListener('click', () => {
    randomTown(town1);
    randomTown(town2);
  });
}
