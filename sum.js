
//co2Train doit avoir une valeur par défaut pour les trajets qui n'utilisent pas le train

function summerize(co2Mode, co2Train = 0){
    var co2Tot = co2Mode + co2Train
    alert('Cette livraison va produire : '+Math.floor(co2Tot)+' gCO₂.')
}