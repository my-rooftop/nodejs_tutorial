var M = {
    v : 'v',
    f : function(){
        console.log(this.v);
    }
}

// M을 바깥에서 이용할 수 있도록 export 하겠다는뜻.
module.exports = M;