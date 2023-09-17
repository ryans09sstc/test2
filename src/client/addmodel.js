export function addmodel() {
    document.getElementById("mySidebar").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";

  var htmlSelect = document.getElementById('lstBox1');
  var text = "model1"
  var dvalue = "5"
  htmlSelect.add(new Option(text, dvalue));
console.log(htmlSelect)

  }