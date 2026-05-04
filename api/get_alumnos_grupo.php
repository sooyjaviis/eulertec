<?php
ob_start(); 
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

$grupo_id = isset($_GET['grupo_id']) ? intval($_GET['grupo_id']) : 0;
$materia_id = isset($_GET['materia_id']) ? intval($_GET['materia_id']) : 0;
$alumnos = [];

if ($grupo_id > 0 && $materia_id > 0) {
    try {
        // La consulta ahora trae los nombres desde la tabla usuarios
        $sql = "SELECT 
                    u.id, 
                    u.nombre, 
                    u.apellido_paterno, 
                    u.apellido_materno,
                    IFNULL(c.parcial_1, 0) as parcial_1,
                    IFNULL(c.parcial_2, 0) as parcial_2,
                    IFNULL(c.parcial_3, 0) as parcial_3
                FROM usuarios u
                LEFT JOIN calificaciones c ON u.id = c.alumno_id AND c.materia_id = ?
                WHERE u.grupo_id = ? AND u.rol_id = 4"; 

        $stmt = $conn->prepare($sql);
        if ($stmt) {
            $stmt->bind_param("ii", $materia_id, $grupo_id);
            $stmt->execute();
            $result = $stmt->get_result();
            while ($row = $result->fetch_assoc()) {
                // Calculamos el promedio aquí mismo para facilitar la carga
                $p1 = floatval($row['parcial_1']);
                $p2 = floatval($row['parcial_2']);
                $p3 = floatval($row['parcial_3']);
                $row['promedio'] = number_format(($p1 + $p2 + $p3) / 3, 2);
                $alumnos[] = $row;
            }
            $stmt->close();
        }
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(["error" => $e->getMessage()]);
        exit;
    }
}
ob_clean();
echo json_encode($alumnos);