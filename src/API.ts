import axios from 'npm:axios@1.7.7'

const instance = axios.create({
    withCredentials: true,
})
let CurrentXCsrf: string | undefined
instance.interceptors.response.use((Response) => {
    return Response
}, (ErrorResponse) => {
    return ErrorResponse.response
})
instance.interceptors.response.use(async (Response) => {
    if (Response && Response.headers && Response.headers['x-csrf-token']) {
        const ReRun = !!CurrentXCsrf
        CurrentXCsrf = Response.headers['x-csrf-token']
        if (ReRun) {
            Response.config.headers['x-csrf-token'] = CurrentXCsrf
            await axios.request(Response.config).then((_Response) => {
                Response = _Response
            }).catch((ErrorResponse) => {
                Response = ErrorResponse.response
            })
        }
    }
    return Response
})
instance.post('https://auth.roblox.com/v1/login')

instance.interceptors.request.use(async (Request) => {
    return new Promise((res) => {
        const interval = setInterval(() => {
            if (!CurrentXCsrf) { return }
            clearInterval(interval)
            Request.headers['x-csrf-token'] = CurrentXCsrf
            
            Request.headers['Cookie'] = `.ROBLOSECURITY=${Deno.env.get('RobloxToken')};`
            res(Request)
        }, 100)
    })
})


export default instance