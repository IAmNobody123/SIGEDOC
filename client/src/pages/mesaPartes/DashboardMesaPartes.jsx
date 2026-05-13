import { useNavigate } from 'react-router-dom';

export default function DashboardMesaPartes() {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Panel de Mesa de Partes</h2>
            <p>Bienvenido al módulo de Mesa de Partes. Aquí puedes gestionar el ingreso y derivación de documentos.</p>
        </div>
    )
}