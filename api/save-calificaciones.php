<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php';

// Obtenemos los datos enviados por React
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['calificaciones'])) {
    echo json_encode(["error" => true, "message" => "No hay datos para guardar"]);
    exit;
}

try {
    $conn->begin_transaction(); // Usamos transacciones por seguridad

    foreach ($data['calificaciones'] as $c) {
        $alumno_id = intval($c['alumno_id']);
        $materia_id = intval($data['materia_id']);
        $p1 = floatval($c['p1']);
        $p2 = floatval($c['p2']);
        $p3 = floatval($c['p3']);
        $final = floatval($c['final']);

        // Usamos ON DUPLICATE KEY para que si ya existe la calificaion, la actualice
        $sql = "INSERT INTO calificaciones (alumno_id, materia_id, parcial1, parcial2, parcial3, final) 
                VALUES ($alumno_id, $materia_id, $p1, $p2, $p3, $final)
                ON DUPLICATE KEY UPDATE 
                parcial1 = VALUES(parcial1), 
                parcial2 = VALUES(parcial2), 
                parcial3 = VALUES(parcial3), 
                final = VALUES(final)";
        
        $conn->query($sql);
    }

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Calificaciones guardadas en BD"]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["error" => true, "message" => $e->getMessage()]);
}
$conn->close();
?>