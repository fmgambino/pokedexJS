//Variables que hacen referencias al DOM

const d = document,
  synth = window.speechSynthesis,
  utterThis = new SpeechSynthesisUtterance(),
  $mainScreen = d.querySelector(".screen"),
  $secondScreen = d.querySelector(".pokeindex-right__screen"),
  $nameScreen = d.querySelector(".controller-touch"),
  $searchInput = d.querySelector(".input-poke"),
  $lightSpeak = d.querySelector(".circle-big"),
  $lightSpeakSmall = d.querySelector(".status-light"),
  $powerBtn = d.querySelector(".buttons-circle"),
  $soundPowerBtn = d.createElement("audio"),
  $sonido2 = d.createElement("audio"),
  $textPaused = d.querySelector(".text-paused"),
  $btnStartSearch = d.querySelector(".btn-buscar"),
  $btnStopSearch = d.querySelector(".btn-stop");

let voices = [];

//Enciende las luces de la pokedex
const onLightSpeak = () => {
  $lightSpeak.classList.add("is-speak");
  $lightSpeakSmall.classList.add("is-speak");
};

//Apaga las luces de la pokedex
const offLightSpeak = () => {
  $lightSpeak.classList.remove("is-speak");
  $lightSpeakSmall.classList.remove("is-speak");
};

//Narra la información del pokémon
const pokedexSpeak = (
  name,
  type,
  species,
  mainAttack,
  secondaryAttack,
  detail,
  detail2,
  detail3
) => {
//Aqui hago que la pokedex hable recurriendo a las variables previamente establecidas.
  const phrase = `
    ${name}. Pokémon tipo ${type}. Perteneciente a la especie ${species}. 
    Sus ataques más poderosos son: ${mainAttack} y ${secondaryAttack}. ${detail} ${detail2} ${detail3}
  `;
  utterThis.text = phrase;
  utterThis.voice = voices[1];
  utterThis.rate = 1.4;

  if (synth.speaking) {
    synth.cancel();
    synth.speak(utterThis);
  }

  synth.speak(utterThis);

  utterThis.onstart = () => {
    onLightSpeak();
  };

  utterThis.onend = () => {
    offLightSpeak();
    if (!$powerBtn.classList.contains("is-off")) {
      $btnStartSearch.classList.remove("disabled");      
      $btnStopSearch.classList.remove("disabled");
      $searchInput.removeAttribute("disabled");
    }
  };
};

//Renderiza error en pantalla
const renderError = (err) => {
  let message = err.statusText || "Ha ocurrido un error";
  $mainScreen.innerHTML = `😮: ${message}`;
  $secondScreen.innerHTML =
    "<p>No encontramos lo que buscabas, intentalo nuevamente...</p>";
  $searchInput.removeAttribute("disabled");
  $btnStartSearch.classList.remove("disabled");
};

//Llamada a la API de Pokémon mediante Fetch
async function getDataPokemon() {
  let searchValue = $searchInput.value.toLowerCase();
  let pokeApi = `https://pokeapi.co/api/v2/pokemon/${searchValue}`;

  try {
    $secondScreen.innerHTML = `<img class="loader" src="asset/img/puff.svg" alt="Cargando...">`;
    $mainScreen.innerHTML = `<img class="loader" src="asset/img/puff.svg" alt="Cargando...">`;

    let res = await fetch(pokeApi);
    pokemon = await res.json();

    if (!res) throw { status: res.status, statusText: res.statusText };

    try {
      let res = await fetch(pokemon.types[0].type.url);
      pokemonType = await res.json();

      if (!res) throw { status: res.status, statusText: res.statusText };
    } catch (error) {
      let message = error.statusText || "Ha ocurrido un error"
      $secondScreen.innerHTML =
      "<p>Algunos pokemones son tan dificil de encontrar, que no se tiene informacion acerca de ellos...con suerte podemos encontrar alguna imagen que los represente.</p>"
    }

    try {
      let res = await fetch(pokemon.species.url),
        pokemonSpecies = await res.json();

      if (!res) throw { status: res.status, statusText: res.statusText };

      try {
        let res = await fetch(pokemon.moves[0].move.url);
        pokemonMove = await res.json();
        let res2 = await fetch(pokemon.moves[1].move.url);
        pokemonMove2 = await res2.json();

        if (!res) throw { status: res.status, statusText: res.statusText };
        if (!res2) throw { status: res2.status, statusText: res2.statusText };
      } catch (error) {
        renderError(error);
      }

      $btnStartSearch.classList.add("disabled");
      $searchInput.setAttribute("disabled", true);

      $mainScreen.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      `;

      $nameScreen.innerHTML = `
        <p>${pokemon.name.toUpperCase()}</p>
      `;

  /*    $secondScreen.innerHTML = `
        <p class="pokemon-name">Tipo: ${pokemonType.names[5].name}</p>
        <p class="pokemon-attacks">Ataques:</p>
        <p class="pokemon-attack-1">- ${pokemonMove.names[5].name}</p>
        <p class="pokemon-attack-2">- ${pokemonMove2.names[5].name}</p>
        <p class="pokemon-species">Especie: ${pokemonSpecies.genera[5].genus}</p>
      `;*/

      $secondScreen.innerHTML = `
      <p>Tipo: ${pokemonType.name[4].name}</p>
      <br>
      <p>Ataques:</p>
      <br>
      <ul>
        <li>${pokemon.moves[0].move.name}</li>
        <br>
        <li>${pokemon.moves[1].move.name}</li>
        <br>
        <li>${pokemon.moves[2].move.name}</li>
        <br>
      </ul>
      <br><br><br>
      <p>Especie ${pokemonSpecies.genera[5].genus}</p>
      `;


      let pokemonDetails = pokemonSpecies.flavor_text_entries; //Solicito a la API el idioma

      const detailsPokemon = pokemonDetails.filter(
        (detail) => detail.language.name === "es"  //Filtro el idioma en espaniol
      );
//Aqui hago que hable en espaniol
      pokedexSpeak(
        pokemon.name,
        pokemonType.names[5].name,
        pokemonSpecies.genera[5].genus,
        pokemonMove.names[5].name,
        pokemonMove2.names[5].name,
        detailsPokemon[0].flavor_text.replace(/\n/g, " "), //Reemplazo salto de linea por espacio vacio.
        detailsPokemon[1].flavor_text.replace(/\n/g, " "),
        detailsPokemon[2].flavor_text.replace(/\n/g, " ")
      );
    } catch (error) {
      renderError(error);
    }
  } catch (error) {
    renderError(error);
  }
}

//Enciende la pokedex
const onPokedex = () => {
  $powerBtn.classList.remove("is-off");
  $powerBtn.style.background = "#8cc6ff";
  $mainScreen.style.background = "#474445";
  $secondScreen.style.background = "#474445";
  $searchInput.removeAttribute("disabled");
  $searchInput.setAttribute("placeholder", "Ingrese número o nombre");
  $btnStartSearch.classList.remove("disabled");
  $btnStopSearch.classList.remove("disabled");

  $soundPowerBtn.play();
  $sonido2.play();
  $sonido2.volume=1;
};

//Apaga la pokedex
const offPokedex = () => {
  synth.cancel();
  $powerBtn.classList.add("is-off");
  $powerBtn.style.background = "#474445";
  $mainScreen.style.background = "#000000";
  $secondScreen.style.background = "#000000";
  $mainScreen.innerHTML = "";
  $secondScreen.innerHTML = "";
  $nameScreen.innerHTML = "";
  $searchInput.value = "";
  $searchInput.setAttribute("disabled", true);
  $searchInput.setAttribute("placeholder", "");
  $btnStartSearch.classList.add("disabled");
  $btnStopSearch.classList.add("disabled");
  $sonido2.pause();
  
  offLightSpeak();
};

/* Delegación de Eventos */
d.addEventListener("click", (e) => {
  e.preventDefault();

  if (!$powerBtn.classList.contains("is-off")) {
    if (e.target === $btnStartSearch) {
      $sonido2.volume=0.1;
      $searchInput.value !== ""
        ? getDataPokemon()
        : alert(
            "Debe ingresar el numero o nombre del pokémon que desea buscar"
          );
    }

    if (e.target === $btnStopSearch) {
      synth.cancel();
      $textPaused.textContent = "";
    }

    if (e.target.matches(".btn-play") || e.target.matches(".btn-play img")) {
      if (synth.speaking) {
        onLightSpeak();
        synth.resume();
        $textPaused.textContent = "";
      }
    }

    if (e.target.matches(".btn-pause") || e.target.matches(".btn-pause img")) {
      synth.pause();
      if (synth.speaking) {
        offLightSpeak();
        $textPaused.textContent = "PAUSADO";
      }
    }
  }

  if (
    e.target.matches(".buttons-circle") ||
    e.target.matches(".buttons-circle img")
  ) {
    $soundPowerBtn.src = "asset/mp3/xbox-360-on.mp3"; //on pokedex mp3
    $soundPowerBtn.play();

    $sonido2.src = "asset/mp3/pokemon-intro.mp3";
    $sonido2.play ();
   // $sonido2.volume(0.1);
    $powerBtn.classList.contains("is-off") ? onPokedex() : offPokedex();
  console.log($soundPowerBtn);
  console.log($sonido2);
   
  }
});

d.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    if (!$powerBtn.classList.contains("is-off")) {
      $searchInput.value !== ""
        ? getDataPokemon()
        : alert(
            "Debe ingresar el numero o nombre del pokémon que desea buscar"
          );
    }
  }
});

d.addEventListener("DOMContentLoaded", (e) => {
  window.speechSynthesis.addEventListener("voiceschanged", (e) => {
    voices = window.speechSynthesis.getVoices();
  });
  synth.cancel();
  $powerBtn.classList.add("is-off");
  $searchInput.setAttribute("disabled", true);
  $searchInput.setAttribute("placeholder", "");
  $btnStartSearch.classList.add("disabled");
  $btnStopSearch.classList.add("disabled");



  console($btnStartSearch, $sonido2);
});