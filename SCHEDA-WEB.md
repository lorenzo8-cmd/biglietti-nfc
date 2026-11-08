# Scheda web per i biglietti NFC

La pagina `card.html?c=IDENTIFICATIVO` legge in tempo reale `IDENTIFICATIVO.vcf` da questo sito. Funziona anche con il nome completo di un file vCard. Non richiede modifiche all'app desktop, esportazioni aggiuntive o un elenco clienti pubblico nella pagina iniziale.

Per ottenere il link di un cliente, aprire [Crea link scheda](collegamento.html) e incollare il link NFC copiato dall'app. La pagina funziona anche per i contatti pubblicati in futuro. Il tag NFC deve essere riscritto con il link web. Un QR stampato con il vecchio indirizzo .vcf continua ad aprire il file originale e non può essere trasformato in una pagina web da questa aggiunta.

## Comportamento

- Android: mostra la scheda web con nome, attività, telefono, email, sito e indirizzo. Salva contatto prova un Intent INSERT su gesto dell'utente, con fallback al file vCard. Le app Contatti devono consentire l'apertura dal browser: non è garantito su tutti i dispositivi. È sempre disponibile il link diretto al file, con istruzioni per importarlo.
- iPhone/iPad: prova ad aprire automaticamente la vCard originale una volta per sessione; il pulsante Salva resta disponibile. Aggiungere `&view=1` per vedere la pagina senza apertura automatica.
- Computer: scheda web e link alla vCard.

I file .vcf esistenti, il programma Windows e i link originali non vengono modificati. Gli aggiornamenti da desktop restano la fonte dei dati. La pagina usa solo i dati già pubblicati, senza analytics, font esterni o catalogo pubblico dei contatti; l'assenza di indicizzazione non costituisce controllo degli accessi.

Le prove browser verificano interfaccia, lettura vCard, link e fallback. L'apertura delle app Contatti va provata su dispositivi fisici: l'emulazione browser non può certificarla.

Riferimenti: [Chrome Android Intents](https://developer.chrome.com/docs/android/intents), [GitHub Pages e tipi MIME](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site#mime-types-on-github-pages).
