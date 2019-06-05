 const algorithmia = require('algorithmia')
 const algorithmiaApiKey = require('../credentials/algorithmia.json').apikey
 const sentenceBoundaryDetection = require('sbd')

 const watsonApiKey = require('../credentials/watson-nlu.json').apikey
 const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
 const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

 async function robot(content){
	 // Verificar se recebei corretamente o contente com os termos de busca
	// console.log(`Recebi com sucesso o contet:  ${content.searchTerm}`)
	 await fetchContentFromWikepedia(content)
	 sanitizeContent(content)
	 breakContentIntoSentences(content)
	 limitMaximumSentences(content)
	 await fetchKeywordsOfAllSentences(content)

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

function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences)
}

async function fetchKeywordsOfAllSentences(content) {
    console.log('> [text-robot] Starting to fetch keywords from Watson')

    for (const sentence of content.sentences) {
      console.log(`> [text-robot] Sentence: "${sentence.text}"`)

      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)

      console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
    }
}

async function fetchWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      }, (error, response) => {
        if (error) {
          reject(error)
          return
        }

        const keywords = response.keywords.map((keyword) => {
          return keyword.text
        })

        resolve(keywords)
      })
})

   }

 }
 module.exports = robot

