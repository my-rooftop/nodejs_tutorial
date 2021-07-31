

var g = function(){
    console.log(1 + 1);
    console.log(1 + 2);
}


console.log(g);

g();

var a = [g];
a[0]();
console.log(a[0]);

var o = {
    func:g
}


o.func();