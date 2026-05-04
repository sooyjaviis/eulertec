<?php
include 'db.php';
// Vamos a ver si existen calificaciones en la tabla para cualquier alumno
$sql = "SELECT * FROM calificaciones LIMIT 5";
$res = $conn->query($sql);
echo "<h1>Prueba de Datos</h1>";
if($res->num_rows > 0){
    while($row = $res->fetch_assoc()){
        echo "Alumno ID: " . $row['alumno_id'] . " - Materia ID: " . $row['materia_id'] . " - Final: " . $row['final'] . "<br>";
    }
} else {
    echo "LA TABLA DE CALIFICACIONES ESTÁ VACÍA EN LA BD.";
}