<?php
// 1. Permitir cualquier origen (o puedes poner http://localhost:5173 para ser específico)
header("Access-Control-Allow-Origin: *");

// 2. Permitir métodos comunes
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// 3. Permitir cabeceras como Content-Type (necesaria para JSON)
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// 4. Manejar la petición "OPTIONS" (Preflight) que hace el navegador automáticamente
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ... aquí sigue tu conexión a la base de datos (mysqli) ...

$host = 'localhost';
$user = 'root'; // Usa el usuario que creaste en Hostinger
$pass = ''; 
$db   = 'sistema_calificaciones'; // El nombre de la BD en Hostinger

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die(json_encode(["error" => "Error de conexión: " . $conn->connect_error]));
}
?>