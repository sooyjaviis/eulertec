<?php
include 'db.php';

$sql = "SELECT MIN(id) AS id, nombre_materia FROM materias GROUP BY nombre_materia";
$result = $conn->query($sql);

$materias = [];
while($row = $result->fetch_assoc()) {
    $materias[] = $row;
}

echo json_encode($materias);
?>