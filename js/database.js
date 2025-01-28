/**
 * IMPORTS
*/
import { Client, Databases, Query, ID } from "appwrite";

/* APPWRITE */

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Your API Endpoint
    .setProject('67430862002f1a00b7e1'); // Your project ID

const databases = new Databases(client);


/* FETCH APPwrite */


export async function fetchCards() {



	const response = await databases.listDocuments(
		'6743087b003027b1764f', // databaseId
		'6744bcd5001fa49686f7', // collectionId
		[ 		
		
			Query.select(["title", "content", "$id"])
			
		] // queries (optional)
	);
	
	//console.log(response.documents);
	
	const cards = response.documents;

	return cards;
  
}


/**
 * FETCH ONE CARD
 */
export async function fetchCard(id) {
	let { data: cards, error } = await databases
		.from('cards')
		.select('*')
		.eq('id', id)

	// oops!!
	if (error) {
		console.error(error);
		return false;
	}

	return cards;
}





/**
 * INSERT NEW CARD
 */
export async function insertCard(title, content) {
    try {
        const response = await databases.createDocument(
            '6743087b003027b1764f', // ID databáze
            '6744bcd5001fa49686f7', // ID kolekce
            'unique()', // Automaticky generované unikátní ID dokumentu
            { title, content } // Data k uložení
        );
        return response;

    } catch (error) {
        console.error(error.message);
        return false;
    }
}


export async function updateCard(id, title, content) {
    	
    try {
        const response = await databases.updateDocument(
            "6743087b003027b1764f", //  ID appwrite database
            "6744bcd5001fa49686f7", //  ID appwrite kolekce
            id, // ID dokumentu, který chcete aktualizovat
            { title, content } // Nová data pro aktualizaci
        );

        return response; // Vrací aktualizovaný dokument
    } catch (error) {
        console.error("Chyba při aktualizaci karty:", error.message);
        return false; // Můžete vrátit `null` nebo jiný indikátor chyby
    }
}


export async function deleteCard(id) {
	
	//console.log('Smazané ID: ' + id);

	try {
		await databases.deleteDocument(
			'6743087b003027b1764f', // databaseId
			'6744bcd5001fa49686f7', // collectionId
			id // zde použijeme hodnotu proměnné id
		);
		console.log("Karta byla úspěšně smazána.");
		return true;
	} catch (error) {
		console.error("Chyba při mazání karty:", error);
		return false;
	}
}
	

