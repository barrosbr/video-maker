	const readline = require('readline-sync')

	function start(){
		const content = {}

		content.search = askAndReturnSearchTerm()
		content.prefixo = askAndReturnPrefixo()

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
