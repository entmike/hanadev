module.exports = {
    logger () {
        let _logs = [];
        return {
            log : (message)=>{
                _logs.push(message);
                console.log(message);
            },
            logs : ()=>{
                return _logs;
            }
        }
    }
}