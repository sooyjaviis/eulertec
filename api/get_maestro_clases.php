<?php
ob_start(); 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

if ($conn->connect_error) {
    ob_clean();
    echo json_encode(["error" => "Error de conexión: " . $conn->connect_error]);
    exit;
}

$maestro_id = isset($_GET['maestro_id']) ? intval($_GET['maestro_id']) : 0;
$clases = [];

if ($maestro_id > 0) {
    try {
        /**
         * SQL FINAL BASADO EN TU ESTRUCTURA:
         * Tabla 'grupos' -> 'nombre_group'
         * Tabla 'materias' -> 'nombre_materia'
         */
        $sql = "SELECT 
                    am.id, 
                    am.grupo_id, 
                    am.materia_id, 
                    am.ciclo_escolar, 
                    g.nombre_group, 
                    m.nombre_materia
                FROM asignaciones_maestros am
                INNER JOIN grupos g ON am.grupo_id = g.id
                INNER JOIN materias m ON am.materia_id = m.id
                WHERE am.maestro_id = ?";

        $stmt = $conn->prepare($sql);
        
        if ($stmt) {
            $stmt->bind_param("i", $maestro_id);
            $stmt->execute();
            $result = $stmt->get_result();

            while ($row = $result->fetch_assoc()) {
                $clases[] = [
                    "id" => $row['id'],
                    "grupo_id" => $row['grupo_id'],
                    "materia_id" => $row['materia_id'],
                    "ciclo_escolar" => $row['ciclo_escolar'],
                    "nombre_grupo" => $row['nombre_group'], 
                    "nombre_materia" => $row['nombre_materia']
                ];
            }
            $stmt->close();
        } else {
            throw new Exception("Error en preparación SQL: " . $conn->error);
        }

    } catch (Exception $e) {
        ob_clean();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
        exit;
    }
}

ob_clean();
echo json_encode($clases);