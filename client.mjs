import express from "express"
import { fileURLToPath } from "url"

const app = express()
app.use(express.static('public'))

app.get('/', (req, res) => {
    /**
     * ? or you can do `path.join(dirname(fileURLToPath(import.meta.url)), 'public')`
     * 
     * ! for commonjs module `path.join(__dirname, 'public')`
     */
    res.sendFile('index.html', { root: fileURLToPath(new URL('public', import.meta.url)) })
})

app.listen(3000, () => console.log("listening at 3000"))
