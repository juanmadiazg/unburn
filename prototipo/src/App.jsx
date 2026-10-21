import { Navigate, Route, Routes } from 'react-router-dom'
import Layout, { inicioDe } from './components/Layout'
import { useApp } from './store/AppStore'
import Landing from './pages/publico/Landing'
import Login from './pages/publico/Login'
import Registro from './pages/publico/Registro'
import NoEncontrada from './pages/publico/NoEncontrada'
import Alta from './pages/Alta'
import Resumen from './pages/cliente/Resumen'
import Recomendaciones from './pages/cliente/Recomendaciones'
import Gasto from './pages/cliente/Gasto'
import Claves from './pages/cliente/Claves'
import Presupuestos from './pages/cliente/Presupuestos'
import Agentes from './pages/cliente/Agentes'
import Incidentes from './pages/cliente/Incidentes'
import IncidenteDetalle from './pages/cliente/IncidenteDetalle'
import Contexto from './pages/cliente/Contexto'
import Auditoria from './pages/cliente/Auditoria'
import Probador from './pages/cliente/Probador'
import Desarrolladores from './pages/cliente/Desarrolladores'
import Alertas from './pages/cliente/Alertas'
import Suscripcion from './pages/cliente/Suscripcion'
import Usuarios from './pages/cliente/Usuarios'
import Soporte from './pages/cliente/Soporte'
import Ajustes from './pages/cliente/Ajustes'
import Cuenta from './pages/comun/Cuenta'
import Notificaciones from './pages/comun/Notificaciones'
import BoDireccion from './pages/backoffice/Direccion'
import BoClientes from './pages/backoffice/Clientes'
import BoTickets from './pages/backoffice/Tickets'
import BoIncidencias from './pages/backoffice/Incidencias'
import BoModelos from './pages/backoffice/Modelos'
import BoEnterprise from './pages/backoffice/Enterprise'
import BoSocios from './pages/backoffice/Socios'
import BoCobros from './pages/backoffice/Cobros'
import BoProveedores from './pages/backoffice/Proveedores'
import BoInforme from './pages/backoffice/Informe'

function InicioBackoffice() {
  const { persona } = useApp()
  return <Navigate to={inicioDe(persona)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/alta" element={<Alta />} />
      <Route path="/app" element={<Layout zona="cliente" />}>
        <Route index element={<Resumen />} />
        <Route path="recomendaciones" element={<Recomendaciones />} />
        <Route path="gasto" element={<Gasto />} />
        <Route path="claves" element={<Claves />} />
        <Route path="presupuestos" element={<Presupuestos />} />
        <Route path="agentes" element={<Agentes />} />
        <Route path="incidentes" element={<Incidentes />} />
        <Route path="incidentes/:id" element={<IncidenteDetalle />} />
        <Route path="contexto" element={<Contexto />} />
        <Route path="contexto/:sesionId" element={<Contexto />} />
        <Route path="auditoria" element={<Auditoria />} />
        <Route path="probador" element={<Probador />} />
        <Route path="desarrolladores" element={<Desarrolladores />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="suscripcion" element={<Suscripcion />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="soporte" element={<Soporte />} />
        <Route path="soporte/:id" element={<Soporte />} />
        <Route path="ajustes" element={<Ajustes />} />
        <Route path="cuenta" element={<Cuenta />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="*" element={<NoEncontrada dentro />} />
      </Route>
      <Route path="/bo" element={<Layout zona="backoffice" />}>
        <Route index element={<InicioBackoffice />} />
        <Route path="direccion" element={<BoDireccion />} />
        <Route path="clientes" element={<BoClientes />} />
        <Route path="tickets" element={<BoTickets />} />
        <Route path="tickets/:id" element={<BoTickets />} />
        <Route path="incidencias" element={<BoIncidencias />} />
        <Route path="modelos" element={<BoModelos />} />
        <Route path="enterprise" element={<BoEnterprise />} />
        <Route path="socios" element={<BoSocios />} />
        <Route path="cobros" element={<BoCobros />} />
        <Route path="proveedores" element={<BoProveedores />} />
        <Route path="informe" element={<BoInforme />} />
        <Route path="cuenta" element={<Cuenta />} />
        <Route path="notificaciones" element={<Notificaciones />} />
        <Route path="*" element={<NoEncontrada dentro />} />
      </Route>
      <Route path="*" element={<NoEncontrada />} />
    </Routes>
  )
}
