	const readline = require('readline-sync')
        const robots = {
		text: require('./robots/text.js')
	}

        async function start(){
		const content = {}

		content.searchTerm = askAndReturnSearchTerm()
		content.prefixo = askAndReturnPrefixo()

		await robots.text(content)

		function askAndReturnSearchTerm() {
			return readline.question ('Digite um termo pra busca: ')
		}
		function askAndReturnPrefixo() {
			const prefixos = ['Quem é','O que é', 'A historia do']
			const selectPrefixosIndex = readline.keyInSelect(prefixos)
			const selectPrefixosText = prefixos[selectPrefixosIndex]

			return selectPrefixosText
		}
		console.log(content)
	}
	start()
