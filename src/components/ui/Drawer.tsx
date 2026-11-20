import type { ReactNode } from "react";
import { Offcanvas } from "react-bootstrap";

/** Right-hand detail panel for a mention, alert or insight (F-12). Full width on phones. */
export function Drawer({
  show,
  onClose,
  title,
  children,
  footer,
}: {
  show: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      className="ui-drawer"
    >
      <Offcanvas.Header closeButton closeLabel="Close">
        <Offcanvas.Title as="h5">{title}</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>{children}</Offcanvas.Body>
      {footer && <div className="border-top p-3">{footer}</div>}
    </Offcanvas>
  );
}
