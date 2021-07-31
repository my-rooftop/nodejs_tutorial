

var o = {
    v1 : 'v1',
    v2 : 'v2',
    f1 : function (){
        console.log(this.v1);
    },
    f2 : function (){
        console.log(this.v2);
    }
} //마치 폴더로 파일 정리하는 느낌임.

o.f1();
o.f2();
