const { RequiredArg, Command } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")

class MineSweeperCell {
    constructor() {
        this.isbomb = false
        this.isrevealed = false
        this.isflagged = false
        this.nearbybombs = 0
    }

    setNearbyCells(board, cx, cy) {
        for (let y = cy - 1; y <= cy + 1; y++) {
            if (!board[y]) continue
            for (let x = cx - 1; x <= cx + 1; x++) {
                if ((x == cx && y == cy) || !board[y][x]) continue
                else if (board[y][x].isbomb) this.nearbybombs = this.nearbybombs + 1
            }
        }
    }
}

class MineSweeperGame {
    constructor() {
        let bomblocations = [
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
            [Math.floor(Math.random() * 9), Math.floor(Math.random() * 9)],
        ]
        this.board = []
        for (let y = 0; y < 9; y++) {
            this.board[y] = []
            for (let x = 0; x < 9; x++) {
                this.board[y][x] = new MineSweeperCell()
            }
        }
        for (let i = 0; i <= 9; i++) {
            while (true) {
                if (!this.board[bomblocations[i][0]][bomblocations[i][1]].isbomb) {
                    this.board[bomblocations[i][0]][bomblocations[i][1]].isbomb = true
                    break
                }
                bomblocations[i][0] = Math.floor(Math.random() * 9)
                bomblocations[i][1] = Math.floor(Math.random() * 9)
            }
        }
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                this.board[y][x].setNearbyCells(this.board, x, y)
            }
        }
    }

    get tilesleft() {
        let tiles = -10
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (!this.board[y][x].isrevealed) {
                    tiles = tiles + 1
                }
            }
        }
        return tiles
    }

    getBoardInfo(EconomySystem, gameover) {
        let board = ""
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                board = board + (gameover && this.board[y][x].isbomb ?
                    "💥" :
                    this.board[y][x].isrevealed ?
                        MineSweeper.numToTile[this.board[y][x].nearbybombs] :
                        (this.board[y][x].isflagged ? "<:flag:877088652600172544>" : "<:ms:876134777701412904>"))
            }
            board = board + y + "\n"
        }
        board = board + ":zero::one::two::three::four::five::six::seven::eight:\n"
        board = board.replace("0\n", ":zero:\n")
        board = board.replace("1\n", ":one:\n")
        board = board.replace("2\n", ":two:\n")
        board = board.replace("3\n", ":three:\n")
        board = board.replace("4\n", ":four:\n")
        board = board.replace("5\n", ":five:\n")
        board = board.replace("6\n", ":six:\n")
        board = board.replace("7\n", ":seven:\n")
        board = board.replace("8\n", ":eight:\n")
        return new Discord.MessageEmbed()
            .setColor("#d3d3d3")
            .setTitle(EconomySystem.user + "'s MineSweeper board")
            .setDescription(board)
            .setFooter(gameover ? "Game Over" : this.tilesleft + " tiles left")
            .setTimestamp()
    }
}

MineSweeper = new Game(() => {
    return new MineSweeperGame()
})
MineSweeper.numToTile = [":black_large_square:", ":one:", ":two:", ":three:", ":four:", ":five:", ":six:", ":seven:", ":eight:"]
MineSweeper.help =
    "`&msweeper board` shows the current board\n" +
    "`&msweeper dig (x) (y)` digs in the given location, the dug tile will give information about the nearby tiles..or explode!\n" +
    "`&msweeper flag (x) (y)` puts a flag in the given location, does nothing, but can be used to remember the mines locations"

Commands.msweeper = new Command("Isolate all the mines, and dont explode!\n\n" + MineSweeper.help, (message, args) => {
    const MineSweeperGameConstructor = MineSweeperGame
    let EconomySystem = Economy.getEconomySystem(message.author)
    args[0] = args[0].toLowerCase()
    switch (args[0]) {
        case "board": {
            message.channel.send({ embeds: [MineSweeper.getGame(message.author.id).getBoardInfo(EconomySystem)] })
            return
        }
        case "dig": {
            /** @param {string} position @returns {number[]} */
            function parsePosition(position) {
                if (/^\d+-\d+$/.test(position)) {
                    const [from, to] = position.split('-')
                        .map((value) => parseFloat(value))
                        .sort((a, b) => a - b)

                    return [...Array(to + 1).keys()].slice(from)
                }

                if (/^\d+(,\d+)+$/.test(position)) {
                    return position.split(',')
                        .map((value) => parseInt(value))
                }

                return [parseInt(position)]
            }

            const x = parsePosition(args[1])
            const y = parsePosition(args[2])

            console.log(x,y);

            if ([...x,...y].some(isNaN)) {
                message.channel.send(`You need to give valid coordinates for where to dig\nExample: \`${Prefix.get(message.guild.id)}msweeper dig 0 0\` will dig the tile in the top left corner\n\nYou could also put a range (N-N) or a comma seperated list of positions (N,N,...)\nExample: \`${Prefix.get(message.guild.id)}msweeper dig 0-8 0,2,4,6,8\``)
                return
            }

            if ([...x, ...y].some((position) => position < 0 || position > 8)) {
                return void message.channel.send('The location must be between 0 and 8!')
            }
            const MineSweeperGame = MineSweeper.getGame(message.author.id)

            let CheckNeighbors = []
            let Queue = x.map(x=> y.map(y=> ({x,y}) )).flat()
            do {
                if (Queue.length) {
                    for (let i = 0; i < Queue.length; i++) {
                        CheckNeighbors.push(Queue.pop())
                    }
                    for (const Tileinfo of CheckNeighbors) {
                        if (!MineSweeperGame.board[Tileinfo.y] && !MineSweeperGame.board[Tileinfo.y][Tileinfo.x])
                            message.channel.send("That location is out of bounds.")
                        if (MineSweeperGame.board[Tileinfo.y][Tileinfo.x].isbomb) {
                            message.channel.send({ embeds: [MineSweeperGame.getBoardInfo(EconomySystem, true)] })
                            MineSweeper.list[message.author.id] = new MineSweeperGameConstructor()
                            return 1
                        }

                        if (!MineSweeperGame.board[Tileinfo.y][Tileinfo.x].isbomb &&    !MineSweeperGame.board[Tileinfo.y][Tileinfo.x].isrevealed) {
                            MineSweeperGame.board[Tileinfo.y][Tileinfo.x].isrevealed = true
                            if (!MineSweeperGame.board[Tileinfo.y][Tileinfo.x].nearbybombs)     {
                                const px = Math.min(Tileinfo.x + 1, 8)
                                const mx = Math.max(Tileinfo.x - 1, 0)
                                const py = Math.min(Tileinfo.y + 1, 8)
                                const my = Math.max(Tileinfo.y - 1, 0)
                                Queue.push({ x: Tileinfo.x, y: py })
                                Queue.push({ x: mx, y: py })
                                Queue.push({ x: mx, y: Tileinfo.y })
                                Queue.push({ x: mx, y: my })
                                Queue.push({ x: Tileinfo.x, y: my })
                                Queue.push({ x: px, y: my })
                                Queue.push({ x: px, y: Tileinfo.y })
                                Queue.push({ x: px, y: py })
                            }
                        }
                    }
                }
            } while (Queue.length > 0)
            // }

            message.channel.send({ embeds: [MineSweeperGame.getBoardInfo(EconomySystem)] })
            if (!MineSweeperGame.tilesleft) {
                message.channel.send("You won!")
                EconomySystem.give(300, message)
                EconomySystem.alterValue("msweeper", 1)
                if (EconomySystem.msweeper == 10) {
                    EconomySystem.award("msweeper", message)
                }
                MineSweeper.list[message.author.id] = new MineSweeperGameConstructor()
            }
            return
        }
        case 'flag': {
            /** @param {string} position @returns {number[]} */
            function parsePosition(position) {
                if (/^\d+-\d+$/.test(position)) {
                    const [from, to] = position.split('-')
                        .map((value) => parseFloat(value))
                        .sort((a, b) => a - b)

                    return [...Array(to + 1).keys()].slice(from)
                }

                if (/^\d+(,\d+)+$/.test(position)) {
                    return position.split(',')
                        .map((value) => parseInt(value))
                }

                return [parseInt(position)]
            }

            const x = parsePosition(args[1])
            const y = parsePosition(args[2])

            console.log(args[1],args[2], {x,y});

            if ([...x,...y].some(isNaN)) {
                message.channel.send(`You need to give valid coordinates for where to place the flag\nExample: \`${Prefix.get(message.guild.id)}msweeper flag 0 0\` will place the flag in the top left corner of the board\n\nYou could also put a range (N-N) or a comma seperated list of positions (N,N,...)\nExample: \`${Prefix.get(message.guild.id)}msweeper flag 0-8 0,2,4,6,8\``)
                return
            }

            const MineSweeperGame = MineSweeper.getGame(message.author.id)

            for (const xs of x)
                for (const ys of y)
                    if (MineSweeperGame.board[ys] && MineSweeperGame.board[ys][xs]) {
                        MineSweeperGame.board[ys][xs].isflagged =
                            !MineSweeperGame.board[ys][xs].isflagged

                    } else {
                        message.channel.send("That location is out of bounds.")
                    }

            return void message.channel.send({ embeds: [MineSweeperGame.getBoardInfo(EconomySystem)] })
        }
        default: {
            message.channel.send(MineSweeper.help.replace(/\&/g, Prefix.get(message.guild.id)))
            return
        }
    }
}, "Game", [
    new RequiredArg(0, MineSweeper.help, "command"),
    new RequiredArg(1, undefined, "argument 1", true),
    new RequiredArg(2, undefined, "argument 2", true)
], "https://en.wikipedia.org/wiki/Minesweeper_(video_game)")