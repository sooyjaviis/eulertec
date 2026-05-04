<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
include 'db.php'; 

$data = json_decode(file_get_contents("php://input"), true);

if ($data) {
    $alumno_id = intval($data['alumno_id']);
    $materia_id = intval($data['materia_id']);
    $parcial = intval($data['parcial']); 
    $nota = floatval($data['nota']);
    
    // Coincide con tu BD: parcial_1, parcial_2, o parcial_3
    $columna = "parcial_" . $parcial; 

    // Insertamos la nota y recalculamos el promedio_final automáticamente
    $sql = "INSERT INTO calificaciones (alumno_id, materia_id, $columna) 
            VALUES ($alumno_id, $materia_id, $nota) 
            ON DUPLICATE KEY UPDATE 
                $columna = $nota,
                promedio_final = (IFNULL(parcial_1, 0) + IFNULL(parcial_2, 0) + IFNULL(parcial_3, 0)) / 3";

    if (mysqli_query($conn, $sql)) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => mysqli_error($conn)]);
    }
} else {
    echo json_encode(["success" => false, "message" => "No se recibieron datos"]);
}
?>