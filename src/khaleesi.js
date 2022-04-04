const KhaleesiPostCorrection = {
	/**
	 * @param {string[]} words
	 * @returns {string[]}
	 */
	postCorrection(words) {
		const result = [];

		words.forEach((word) => {
			if (word.length < 2) return result.push(word);

			if (/ийи/gi.test(word)) return result.push(word.replace(/(и)й(и)/gi, "$1$2"));

			if (/^(сьто|чьто)/.test(word)) {
				const randomWhat =
					KhaleesiPostCorrection.WHATS[Math.floor(KhaleesiPostCorrection.WHATS.length * Math.random())];

				return result.push(word.replace(/^(сьто|чьто)/, randomWhat));
			}

			result.push(KhaleesiPostCorrection.randomMixWord(word));
		});

		return result;
	},

	/**
	 * @param {string} word
	 * @returns {string}
	 */
	randomMixWord(word) {
		const mixedUpRules = KhaleesiPostCorrection.POST_CORRECTION_RULES.slice(0);

		for (let i = mixedUpRules.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random() * i);
			[mixedUpRules[i], mixedUpRules[j]] = [mixedUpRules[j], mixedUpRules[i]];
		}

		mixedUpRules.slice(0, 10).forEach((rule) => {
			const [from, to] = rule;
			if (word.search(from) > -1)
				word = word.replace(from, to);
		});

		return word;
	},

	WHATS: ["чьто", "сто", "шьто", "што"],

	POST_CORRECTION_RULES: [
		["ожк", "озьг"],
		["кол", "га"],
		["ко", "га"],
		["колгот", "гагот"],
		["шо", "ша"],
		["дка", "ка"],
		["он", "онь"],
		["б", "п"],
		["хи", "ни"],
		["шк", "к"],
		["тро", "го"],
		["тка", "пка"],
		["кров", "кав"],
		["ра", "я"],
		["дюк", "дю"],
		["ойд", "анд"],
		["дка", "та"],
		["ро", "мо"],
		["ны", "ни"],
		["ре", "е"],
		["ле", "не"],
		["ки", "ке"],
		["ш", "ф"],
		["шка", "вха"],
		["гри", "ги"],
		["ч", "щ"],
		["ре", "ле"],
		["го", "хо"],
		["ль", "й"],
		["иг", "ег"],
		["ра", "ва"],
		["к", "г"],
		["зо", "йо"],
		["зо", "ё"],
		["рё", "йо"],
		["ск", "фк"],
		["ры", "вы"],
		["шо", "фо"],
		["ло", "ле"],
		["сы", "фи"],
		["еня", "ея"],
		["пель", "пюль"],
		["а", "я"],
		["у", "ю"],
		["о", "ё"],
		["ща", "ся"],
		["ы", "и"],
		["ри", "ви"],
		["ло", "во"],
		["е", "и"],
		["и", "е"],
		["а", "о"],
		["о", "а"]
	]
};

const KhaleesiUtils = {
	/** @param {string} str @returns {string[]} */
	getWords: (str) => str.split(/(\s+)/),

	/** @param {string} word @returns {boolean} */
	hasCyrillics: (word) => /[а-яё]/i.test(word),

	/**
	 * @param {string} word
	 * @returns {[string, string, string][]}
	 */
	previousAndNext(word) {
		const result = [];

		for (let i = 0; i < word.length; i++)
			result.push([word[i - 1] || "", word[i], word[i + 1] || ""]);

		return result;
	},

	/**
	 * @param {string} char
	 * @param {string} replacement
	 * @returns {string}
	 */
	replaceWithCase(char, replacement) {
		if (char.toUpperCase() === char)
			return replacement.toUpperCase();
		else
			return replacement.toLowerCase();
	}
};

const KhaleesiEngine = {
	/** @type {{[x: string]: { regexp: RegExp, replacement: string }[]}} */
	globalReplaces: {},

	VOWELS: "аеёиоуыэюя",
	CONSONANTS: "йцкнгшщзхфвпрлджбтмсч",

	/** @type {{[x: string]: string[]}} */
	REPLACES_RULES: {
		/**
		 * @ означает текущую букву
		 * ^ и $ - начало/конец слова (как в регулярных выражениях)
		 * С и Г - любая согласная/гласная буквы
		 * до знака "=" у нас искомый паттерн, а после знака – на что мы будем заменять эту букву
		 * Символ точки – любая буква или символ
		 */

		'а': [
			'^ @ .  = @',
			'[тбвкпмнг]@$  = я',
			'. @ $  = @',
			'. @ я  = @',
			'С @ .  = я',
			'Г @ .  = я',
		],
		'в': [
			'з @ . = ь@'
		],
		'е': [
			'. @ С + $ = @',
			'С @ .   = и',
			'Г @ .   = и',
		],
		'ж': [
			'. @ . = з',
		],
		'л': [
			'^ @ . = @',
			'. @ $ = @',
			'. @р$ = @',
			'л @ . = @@',
			'. @к  = @',
			'. @п  = @',
			'С @ . = @',
			'Г @ . = _',
		],
		'н': [
			'ко@$ = нь',
		],
		'о': [
			'[мпжзгтс]@[цкнгшщзхфвпджбтмсч] = ё',
		],
		'р': [
			'^дра = _',
			'^ @ . = л',
			'Г @ . = й',
			'С @ . = ь',
		],
		'у': [
			'^ @ . = @',
			'. @ . = ю',
		],
		'ч': [
			'^что = сь',
		],
		'щ': [
			'^тыщ$ = сь',
			'^ @ . = @',
			'. @ . = с',
		],
		'ь': [
			'л@ .  = й',
			'. @ $ = @',
			'.@Г$  = @',
			'С@ .  = @',
			'. @ . = й',
		],
	},

	/**
	 * @returns {{[x: string]: { regexp: RegExp, replacement: string }[]}}
	 */
	getReplaces() {
		/* Теперь на основе этих глобальных правил делаем регулярные выражения */
		const tripplesObj = {};

		for (const char in KhaleesiEngine.REPLACES_RULES) {
			const stringPatterns = KhaleesiEngine.REPLACES_RULES[char];

			/** @type {{ regexp: RegExp, replacement: string }[]} */
			const tripples = [];

			stringPatterns.forEach((stringPattern) => {
				const regexpPatternArr = [];
				let [search, replacement] = stringPattern.split("=");
				replacement = replacement.trim().replace(/\@/g, char);

				if (replacement == "_") replacement = "";

				regexpPatternArr.push("(");
				search
					.replace(/\s/g, "")
					.split("")
					.forEach((element) => {
						if (element === "@")
							regexpPatternArr.push(`)(${char})(`);
						else if (element === "Г")
							regexpPatternArr.push("[ьъаеёиоуыэюя]");
						else if (element === "С" || element === "C")
							regexpPatternArr.push("[ьъйцкнгшщзхфвпрлджбтмсч]");
						else
							regexpPatternArr.push(element);
					});
				regexpPatternArr.push(")");

				tripples.push({
					regexp: new RegExp(regexpPatternArr.join(""), "i"),
					replacement
				});
			});

			tripplesObj[char] = tripples;
		}

		return tripplesObj;
	},

	/**
	 * @param {string} word
	 * @returns {string}
	 */
	replaceWord(word) {
		if (!Object.keys(KhaleesiEngine.globalReplaces).length)
			KhaleesiEngine.globalReplaces = KhaleesiEngine.getReplaces();

		if (!KhaleesiUtils.hasCyrillics(word)) return word;

		const result = [];

		KhaleesiUtils.previousAndNext(word).forEach((group) => {
			const [prevChar, currentChar, nextChar] = group;
			const lowerCurrentChar = currentChar.toLowerCase();

			if (KhaleesiEngine.globalReplaces[lowerCurrentChar])
				result.push(
					KhaleesiEngine.replaceChar({
						prevChar,
						currentChar,
						nextChar,
						lowerCurrentChar
					})
				);
			else
				result.push(currentChar);
		});

		return result.join("");
	},

	/**
	 * @param {{ prevChar: string, currentChar: string, nextChar: string, lowerCurrentChar: string }} replaceCharDTO
	 * @returns {string}
	 */
	replaceChar(replaceCharDTO) {
		const { prevChar, currentChar, nextChar, lowerCurrentChar } = replaceCharDTO;
		let currentCharReplacedFlag = false,
			replacedChar = currentChar;

		KhaleesiEngine.globalReplaces[lowerCurrentChar].forEach((tripple) => {
			if (currentCharReplacedFlag) return;

			if (tripple.regexp.test(prevChar + currentChar + nextChar)) {
				replacedChar = (prevChar + currentChar + nextChar).replace(tripple.regexp, tripple.replacement);
				currentCharReplacedFlag = true;

				replacedChar = replacedChar.toLowerCase();
				if (currentChar !== lowerCurrentChar) replacedChar = replacedChar.toUpperCase();

				return;
			}
		});

		return replacedChar;
	}
};

/**
 * @param {string} message
 * @returns {string}
 */
const Khaleesi = (message) => {
	const result = [];

	KhaleesiUtils.getWords(message.trim()).map((word) => {
		if (word.length < 2)
			result.push(word);
		else
			result.push(KhaleesiEngine.replaceWord(word));
	});

	return KhaleesiPostCorrection.postCorrection(result).join("");
};

module.exports = Khaleesi;
