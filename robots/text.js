 const algorithmia = require('algorithmia')
 const algorithmiaApiKey = require('../credentials/algorithmia.json').apikey
 const sentenceBoundaryDetection = require('sbd')


 async function robot(content){
	 // Verificar se recebei corretamente o contente com os termos de busca
	// console.log(`Recebi com sucesso o contet:  ${content.searchTerm}`)
	 await fetchContentFromWikepedia(content)
	 sanitizeContent(content)
	 breakContentIntoSentences(content)

	// breakContentIntoSentences(content)
	// console.log('Verificando se fetchContentFromWikepedia retorna Promise')
	// console.log(fetchContentFromWikepedia())
	 
	 async function fetchContentFromWikepedia(content){
		// return 'Resultado da Promise'
		 const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
		 const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
		 const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
		 const widkipediaContent = wikipediaResponse.get()
		 content.sourceContentOriginal = widkipediaContent.content
		// console.log(widkipediaContent)

	 }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal)
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown)

    content.sourceContentSanitized = withoutDatesInParentheses

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split('\n')

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false
        }

        return true
      })

      return withoutBlankLinesAndMarkdown.join(' ')
    }
  }

  function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }

  function breakContentIntoSentences(content) {
    content.sentences = []

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: []
      })
    })
}

 }
 module.exports = robot

