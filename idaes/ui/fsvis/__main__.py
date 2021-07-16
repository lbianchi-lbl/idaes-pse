import sys
import time

from idaes.ui.fsvis.model_server import FlowsheetServer, find_free_port, _log


def main(args=None):
    args = args or sys.argv[1:]

    if len(args) >= 1:
        port = int(args[0])
    else:
        port = find_free_port()

    _log.info(f'starting server on port {port}')
    server = FlowsheetServer(port)
    server.start()
    _log.info(f'server {server} started')
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        _log.info(f'Shutting down server')
    sys.exit(0)


main()
