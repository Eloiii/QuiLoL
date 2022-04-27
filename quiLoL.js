require('dotenv').config();

async function fetchApi(link) {
      const query = await fetch(link)
      const response = await query.json()
      return response
}

function getMap(id) {
	switch(id) {
		case 11 : return "la faille de l'invocateur"
		case 12 : return "l'âbime hurlant"
		default: return "[map inconnue]"
	}
}

async function getChampion(championId) {
	const championsData = await fetchApi("http://ddragon.leagueoflegends.com/cdn/12.8.1/data/en_US/champion.json")
	const championList = Object.values(championsData.data)
	for(const champion of championList) {
		if(parseInt(champion.key) === championId) {
			return champion.name
		}
	}
	return "[champion inconnu]"
}

async function parseData(data, summonerName) {
	let summoner;
	const participants = data.participants
	for(let participant of participants){
		if(participant.summonerName === summonerName) {
			summoner = participant
			const champion = await getChampion(summoner.championId)
			const time_elapsed = Math.round(data.gameLength / 60)
			const map = getMap(data.mapId)
			return summonerName + " joue " + champion + " sur " + map + " depuis " + time_elapsed + " minutes."
		}
	}
	return "erreur"
}

exports.quiLoL = async function quiLoL(summonerName) {
	const data = await fetchApi("https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + "?api_key=" + process.env.RIOT_API_KEY)
	const summonerId = data.id
	const liveGame = await fetchApi("https://euw1.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/" + summonerId + "?api_key=" + process.env.RIOT_API_KEY)
	const status_code = liveGame?.status?.status_code.toString()
	if(status_code && status_code.startsWith('4')) {
		if(status_code === "404")
			return summonerName + " n'est pas en game actuellement"
		return liveGame.status.message
	}
	const parsedData = await parseData(liveGame, summonerName)
	return parsedData

}

