/**
 * IMPORTS
 */
import * as db from './database.js';
import 'animate.css';


/**
 * SELECT HTML ELEMENTS
 */
const cardContainer = document.querySelector('.cards ul');
const form = document.querySelector('form');
const inputTitle = form.querySelector('input[name=title]');
const inputContent = form.querySelector('input[name=content]');
// Výběr tlačítka Odeslat
const submitButton = document.querySelector('.button-container button[type="submit"]');
// Výběr tlačítka Vymazat
const resetButton = document.querySelector('.button-container button[type="reset"]');

/**
 * CREATE NEW CARD ELEMENT, INSERT INTO DOM
 */


function createNewCard(container, card) {
	const newCard = document.createElement('li');
	newCard.className = 'card animate__animated animate__tada animate__faster';
	newCard.setAttribute('id', `${card.$id}`); 	// Nastavení jedinečného ID z Appwrite
	
	
	//newCard.setAttribute('id', 'card-' + card.id);

	newCard.innerHTML = `
		<h3 class="card-title">${card.title}</h3>
		<p class="card-content">${card.content}</p>
		<a href="?action=delete&id=${card.$id}" class="delete-button">✕</a>
			
	`;

	
	// novo vytvoreny element pridam do rodica
	container.prepend(newCard);
    // console.log('hotovo 👍');
}


/**
 * ON FORM SUBMIT
 */

// Přidání naslouchání události na tlačítko Odeslat
submitButton.addEventListener('click', async function (event) {
    // Zabráníme běžnému chování tlačítka (např. reload stránky)
    event.preventDefault();

    // Zkontrolujeme, zda jsou oba vstupy vyplněny
    if (!inputTitle.value || !inputContent.value) {
        alert('Vyplňte všechny požadované údaje!');
        return;
    }

    // Zde můžete pokračovat s odesíláním dat
    console.log('Formulář je připraven k odeslání:', {
        title: inputTitle.value,
        content: inputContent.value,
    });
});


/*  keyup */

submitButton.addEventListener('click', async function (event) {

	// zabranim beznemu spravaniu formulara (reload stranky)
	event.preventDefault();

	// ak stlacena klavesa NEBOL enter, koncime
	// if (event.code !== 'Enter') return; 

	// we need both title and text
	if (!inputTitle.value || !inputContent.value) return;

	
	// insert new card into db
	db.insertCard(inputTitle.value, inputContent.value)

		.then(cards => {
			if (cards) {
				const card = cards;
				createNewCard(cardContainer, card);
				resetForm();
			}
		});
	});



/**
 * DELETE CARD
 * - kontrolujem kliknutie na rodica, ktory drzi vsetky cards v sebe
 */
cardContainer.addEventListener('click', function (event) {
	// najdem KONKRETNY element, na ktory sme klikli
	const clickedElement = event.target;

	// ak sme klikli KONKRETNE na DELETE (a.delete-button)
	if (clickedElement.classList.contains('delete-button')) {
	
		// delete link ma v href adrese idcko, najdeme ho
		const params = new URLSearchParams(clickedElement.href);
		const id = params.has('id') ? params.get('id') : false;

		if (id) {
			event.preventDefault();

			// odstranime card z databazy
			// potom (then) ho musime vymazat aj z obrazovky (z html kodu)
	
			if (confirm("Opravdu smazat ?")) {
				db.deleteCard(id)
					.then(() => {
						// vymazeme rodica clicknuteho elementu,
						// cize card v ktorom je delete link
						clickedElement.parentNode.remove();
					});
			}
		}
	}
});


/**
 * EDIT (UPDATE) CARD
 * - kontrolujem dvojklik na element, ktory drzi vsetky cards v sebe
 */
cardContainer.addEventListener('dblclick', function (event) {
	// najdem KONKRETNY element, na ktory sme klikli
	const clickedElement = event.target;

	const isTitle = clickedElement.classList.contains('card-title');
	const isContent = clickedElement.classList.contains('card-content');

	
	// ak sme double-clickli bud na nadpis alebo text cardu
	if (isTitle || isContent) {
		// card ma v id povedzme card-57, najdeme z toho cislo 57
		const cardElement = clickedElement.parentNode;

		

		//const id = Number(cardElement.id.replace('card-', ''));

		const id = cardElement.id;


		// zmenime dvojkliknuty element na editovatelny
		clickedElement.setAttribute('contenteditable', true);
		clickedElement.focus(); // nastavime kurzor dnu

		// ked kliknem MIMO tento element, zrusime editovanie
		// a ulozime zmenu
		clickedElement.addEventListener('blur', function () {
			clickedElement.removeAttribute('contenteditable');

			const newTitle = cardElement.querySelector('.card-title').textContent;
			const newContent = cardElement.querySelector('.card-content').textContent;

			//console.log ('id edit ' + id);

			db.updateCard(id, newTitle, newContent)
				.then(() => console.log('aktualizováno 👍'));
		});

		// enter taktiez zavola blur (ten kod hore vyssie)
		clickedElement.addEventListener('keydown', function (event) {
			if (event.code === 'Enter') {
				clickedElement.blur();
			}
		});
	}
});


/**
 * RESET FORM
 */
function resetForm() {
	// premazem inputy
	inputTitle.value = '';
	inputContent.value = '';

	// kurzor zostane blikat v prvom inpute
	inputTitle.focus();
}



// -------------------------
// ----  HLAVNY PROGRAM


/**
 * DOCUMENT READY
 * toto sice u nas neni vylozene potrebne
 * je to kontrola, ci HTML kod je skutocne pripraveny pracovat
 */
document.addEventListener('DOMContentLoaded', function () {
	// ak koniec url adresy vyzera takto ?action=show&id=47
	// zobrazi sa card s idckom 47

	// tymto ziskas tzv. query string "premenne" z url adresy
	// pri ?action=show&id=47 v adrese mame premenne action a id
	// s hodnotami show a 47
	const params = new URLSearchParams(window.location.search);
	let id = false;

	// skontrolujeme, ci v URL adrese je ?action=show
	// ak ano, skusime v adrese najst aj idcko, &id
	if (params.has('action') && params.get('action') === 'show') {
		// je v adrese idcko? ak ano, ulozime ho do id, inak ulozime false
		id = params.has('id') ? params.get('id') : false;
	}

	//console.log('idecko', id);

	// ak mame id-cko, chceme zobrazit 1 konretny card podla idcka
	// v opacnom pripade chceme zobrazit vsetky cards
	if (id) {
		fetchOneCard(id)
	}
	else {
		fetchAllCards()
	}
});


/**
 * FETCH ALL CARDS
 */
function fetchAllCards() {
	
	//console.log('kontrola card ', card);

	db.fetchCards()
		.then(cards => {
			cards.forEach(card => {
				createNewCard(cardContainer, card)
				//console.log('id', card.$id);
				
			});
		});
}



/**
 * FETCH ONE CARD BY ID
 */
function fetchOneCard(id) {
	console.log('fetching one card', id);

	db.fetchCard(id)
		.then(cards => {
			const card = cards[0];
			createNewCard(cardContainer, card);
		});
}



