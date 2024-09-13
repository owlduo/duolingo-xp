// Importa a função fetch do pacote node-fetch para fazer requisições HTTP
import fetch from 'node-fetch';

try {
    // Define o número de lições a serem realizadas
    const licoes = 42;

    // Define a variável LESSONS no ambiente, se não estiver definida, será igual ao valor de 'licoes'
    process.env.LESSONS = process.env.LESSONS ?? licoes;

    // Define o token JWT do Duolingo
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjYzMDcyMDAwMDAsImlhdCI6MCwic3ViIjoxMTMxNjc2MDMxfQ.QOFuBODxQuurIzlLcXD4HTFTfFumDWvERASWDICpvbE';

    // Define o token JWT no ambiente
    process.env.DUOLINGO_JWT = token;

    // // Cria uma nova data e formata para o formato YYYY-MM-DD
    // const newDate = new Date();
    // const year = newDate.getFullYear();
    // const month = String(newDate.getMonth() + 1).padStart(2, '0'); // getMonth() retorna de 0 a 11, então adicionamos 1
    // const day = String(newDate.getDate()).padStart(2, '0');
    // // Formata a data no padrão YYYY-MM-DD
    // const date = `${year}-${month}-${day}`;

    const date = '2017-06-30'

    // Define os cabeçalhos para as requisições HTTP
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DUOLINGO_JWT}`,
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    };

    // Decodifica o token JWT para obter o ID do usuário (sub)
    const { sub } = JSON.parse(
        Buffer.from(process.env.DUOLINGO_JWT.split(".")[1], "base64").toString(),
    );

    // Faz uma requisição para obter os idiomas que o usuário está aprendendo e o idioma de origem
    const { fromLanguage, learningLanguage } = await fetch(
        `https://www.duolingo.com/${date}/users/${sub}?fields=fromLanguage,learningLanguage`,
        { headers }
    ).then((response) => response.json());

    const start = new Date(); // Hora inicial

    let xp = 0; // Inicializa a variável de pontos de experiência (XP)

    const lineLength = 75; // Define o comprimento padrão das linhas

    const formatLine = (icon, text) => `${icon} ---- ${text}`.padEnd(lineLength, '  ');

    console.log(``);
    console.log(formatLine('🙇🏿', 'Sly is amazing, thank Sly for this gift!'));
    console.log(``);

    // Loop para realizar o número de lições definido pela variável de ambiente LESSONS
    for (let i = 0; i < process.env.LESSONS; i++) {
        // Faz uma requisição para iniciar uma nova sessão de prática
        const session = await fetch(
            `https://www.duolingo.com/${date}/sessions`,
            {
                body: JSON.stringify({
                    challengeTypes: [
                        // Tipos de desafio que podem ser praticados
                        "assist", "characterIntro", "characterMatch", "characterPuzzle", "characterSelect", "characterTrace", "characterWrite",
                        "completeReverseTranslation", "definition", "dialogue", "extendedMatch", "extendedListenMatch", "form", "freeResponse",
                        "gapFill", "judge", "listen", "listenComplete", "listenMatch", "match", "name", "listenComprehension", "listenIsolation",
                        "listenSpeak", "listenTap", "orderTapComplete", "partialListen", "partialReverseTranslate", "patternTapComplete",
                        "radioBinary", "radioImageSelect", "radioListenMatch", "radioListenRecognize", "radioSelect", "readComprehension",
                        "reverseAssist", "sameDifferent", "select", "selectPronunciation", "selectTranscription", "svgPuzzle", "syllableTap",
                        "syllableListenTap", "speak", "tapCloze", "tapClozeTable", "tapComplete", "tapCompleteTable", "tapDescribe", "translate",
                        "transliterate", "transliterationAssist", "typeCloze", "typeClozeTable", "typeComplete", "typeCompleteTable", "writeComprehension"
                    ],
                    fromLanguage, // Idioma de origem selecionado pelo usuário
                    isFinalLevel: false, // Indica se é o nível final da lição (false para práticas regulares)
                    isV2: true, // Versão 2 do protocolo de prática
                    juicy: true, // Opção para prática "juicy"
                    learningLanguage, // Idioma que o usuário está aprendendo
                    smartTipsVersion: 2, // Versão 2 das dicas inteligentes
                    type: "GLOBAL_PRACTICE", // Tipo de prática global
                }),
                headers,
                method: "POST", // Método POST para iniciar a sessão de prática
            },
        ).then((response) => response.json());

        // Faz uma requisição para finalizar a sessão iniciada e calcular os pontos de experiência ganhos
        const response = await fetch(
            `https://www.duolingo.com/${date}/sessions/${session.id}`,
            {
                body: JSON.stringify({
                    ...session,
                    heartsLeft: 0, // Número de vidas restantes (0 para práticas sem vidas)
                    startTime: (+new Date() - 60000) / 1000, // Início da sessão há 60 segundos
                    enableBonusPoints: false, // Pontos de bônus
                    endTime: +new Date() / 1000, // Hora atual, fim da sessão
                    failed: false, // Indica se a sessão falhou (false para sucesso)
                    maxInLessonStreak: 9, // Número máximo de lições na sequência
                    shouldLearnThings: true, // Indica se deve aprender coisas (true para aprendizado)
                }),
                headers,
                method: "PUT", // Método PUT para finalizar a sessão de prática
            },
        ).then((response) => response.json());

        xp += response.xpGain; // Acumula os pontos de experiência ganhos

        // Calcula a porcentagem de conclusão das lições
        const progressBarLength = 15; // Comprimento total da barra de progresso
        const progress = ((i + 1) / process.env.LESSONS) * 100;
        const progressBar = `${'█'.repeat((progress / 100) * progressBarLength).padEnd(progressBarLength, ' ')}`;

        process.stdout.write(`\r${formatLine('🍉', `Thank you massa for ${response.xpGain} XP | ${(i + 1)} de ${process.env.LESSONS} | ${progressBar} ${progress.toFixed(2)}% `)}`);
    }

    const end = new Date(); // Hora final
    
    // Calcula a diferença em milissegundos
    const difference = end - start;

    // Converte a diferença de milissegundos para horas, minutos e segundos
    const seconds = Math.floor((difference / 1000) % 60);
    const minutes = Math.floor((difference / (1000 * 60)) % 60);
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

    // Formata a duração no formato 00:00:00
    const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    console.log(`\n`);
    console.log(formatLine('🦍', `I am so grateful for ${xp} XP!`));
    console.log(``);
    console.log(formatLine('🏁', start.toLocaleString()));
    console.log(formatLine('🎌', end.toLocaleString()));
    console.log(formatLine('🕒', formattedDuration));
    console.log(``);

} catch (error) {
    console.log(`\n`);
    console.log("❌ Algo deu errado: ");
    if (error instanceof Error) {
        console.error(error.message); // Exibe a mensagem de erro caso ocorra uma exceção
    }
}
