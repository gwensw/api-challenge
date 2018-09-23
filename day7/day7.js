// for converting physical descriptions to hex colours
const colours = {
  hair: {
    default: '',
    blond: '#D4AC0D',
    blonde: '#D4AC0D',
    'n/a': '',
    none: '',
    brown: '#8B4513',
    black: '#000',
    auburn: '#8B0000',
    white: '#FFFFF0',
    grey: '#A9A9A9',
  },
  eye: {
    default: '#000',
    blue: '#1E90FF',
    yellow: '#FFD700',
    red: '#E51616',
    brown: '#66320E',
    'blue-gray': '#738699',
    black: '#000',
    orange: '#FFA500',
    hazel: '#808000',
    pink: '#FF69B4',
    unknown: '#000',
    gold: '#FFD700',
    white: '#fff'
  },
  skin: {
    default: '#E8E8E8',
    fair: '#FFE4C4',
    gold: '#FFD700',
    white: '#FFFFF0',
    light: '#FFEBCD',
    unknown: '#8B4513',
    green: '#228B22',
    'green-tan': '#808000',
    pale: '#FFF8DC',
    metal: '#C0C0C0',
    dark: '#8B4513',
    brown: '#8B4513',
    grey: '#C0C0C0',
    mottled: '#556B2F',
    orange: '#FF8C00',
    blue: '#1E90FF',
    yellow: '#DFD42F',
    tan: '#D2B48C',
    silver: '#C0C0C0',
    red: '#E51616'
  }
};

function randomFrom(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

function colourCharacter(id, hair = 'default', eye = 'default', skin = 'default') {
  document.querySelector(`#${id}`).style.backgroundColor = colours.skin[skin];
  document.querySelector(`#${id} div.hair`).style.backgroundColor = colours.hair[hair];
  const eyes = document.querySelectorAll(`#${id} div.eye`);
  eyes[0].style.backgroundColor = colours.eye[eye];
  eyes[1].style.backgroundColor = colours.eye[eye];
}

function renderName(id, name) {
  document.getElementById(`${id}__name`).innerHTML = name;
}

function renderInfo(id, species, homeworld) {
  document.querySelector(`#${id}-container p.species`).textContent = `SPECIES: ${species.name}`;
  document.querySelector(`#${id}-container p.homeworld`).textContent = `HOMEWORLD: ${homeworld.name}`;
}

function pickNextContestant(people, contestantsSoFar) {
  let candidate;
  do {
    candidate = randomFrom(people);
  } while (contestantsSoFar.includes(candidate.url));
  return candidate;
}

function renderCharacter(id, char, responses) {
  renderName(id, char.name);
  const [hair, eye, skin] = [char.hair_color, char.eye_color, char.skin_color]
    .map(col => col.split(',')[0].split(' ')[0]);
  colourCharacter(id, hair, eye, skin);
  const [species, homeworld] = responses;
  renderInfo(id, species, homeworld);
}

function animateCharacter(id) {
  document.querySelector(`#${id} .eyes .bruise`).classList.toggle('hidden');
  document.querySelector(`#${id}`).classList.toggle('shake');
  document.querySelector(`#${id} .scrape`).classList.toggle('scraped');
}

function renderEndMessage() {
  document.querySelector('h2').textContent = 'THE GALAXY HAS A WINNER';
  document.querySelector('h3').textContent = 'Reload to fight again';
}

async function getPage(url) {
  const page = await fetch(url);
  return page.json();
}

// pages through API results and returns array of people
async function buildPeopleArray() {
  let peopleArray = [];
  // get the first page of people
  let page = await getPage('https://swapi.co/api/people/?format=json&page=1');
  // keep going while pages remain
  while (page.next) {
    peopleArray = peopleArray.concat(page.results);
    page = await getPage(page.next); // eslint-disable-line
  }
  return peopleArray;
}

async function init() {
  const people = await buildPeopleArray();
  const contestantsSoFar = [];
  function renderNewContestant(id) {
    if (contestantsSoFar.length === people.length) {
      renderEndMessage();
    }
    // pick next contestant
    const char = pickNextContestant(people, contestantsSoFar);
    contestantsSoFar.push(char.url);
    // load extra info about contestant
    const speciesPromise = getPage(char.species);
    const homeworldPromise = getPage(char.homeworld);
    Promise.all([speciesPromise, homeworldPromise])
      .then((responses) => {
        // render the contestant
        // set a timeout here to give the animation time to load
        if (contestantsSoFar.length > 2) animateCharacter(id);
        const waitTime = contestantsSoFar.length > 2 ? 0 : 1000;
        setTimeout(() => {
          renderCharacter(id, char, responses);
        }, waitTime);
      })
      .catch(() => renderNewContestant(id));
  }
  // render the first two characters
  renderNewContestant('char1');
  renderNewContestant('char2');
  // attach event listeners
  document.getElementById('char1-container').addEventListener('click', () => {
    animateCharacter('char2');
    renderNewContestant('char2');
  });
  document.getElementById('char2-container').addEventListener('click', () => {
    animateCharacter('char1');
    renderNewContestant('char1');
  });
}

init();

/* Code below used once to get skin/hair/eye colours for conversion

async function listColours() {
  const hairColours = [];
  const eyeColours = [];
  const skinColours = [];
  const people = await buildPeopleArray();
  people.forEach((person) => {
    if (!skinColours.includes(person.skin_color)) skinColours.push(person.skin_color);
    if (!hairColours.includes(person.hair_color)) hairColours.push(person.hair_color);
    if (!eyeColours.includes(person.eye_color)) eyeColours.push(person.eye_color);
  });
  console.log('hair');
  console.table(hairColours);
  console.log('eye');
  console.table(eyeColours);
  console.log('skin');
  console.table(skinColours);
}

listColours();

 */
