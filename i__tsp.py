"""
@author syt123450 / https://github.com/syt123450
"""

import os
import subprocess


tfjs_workspace = os.path.abspath(
        os.path.join(__file__, os.pardir, 'tfjs')
    )
pb2json_workspace = os.path.abspath(
        os.path.join(__file__, os.pardir, 'tf', 'pb2json')
    )


def install():
    print('Initializing TensorSpace Converter...')
    install_tfjs()
    install_pb2json()
    print('TensorSpace Converter Initialization Completed!')


def install_tfjs():
    path_now = os.getcwd()
    os.chdir(tfjs_workspace)
    subprocess.Popen(["npm install"], stdout=subprocess.PIPE)

    subprocess.run(["powershell", "-Command", "npm install"], capture_output=True)
    
    subprocess.check_call([
        "npm install"
    ])
    os.chdir(path_now)


def install_pb2json():
    path_now = os.getcwd()
    os.chdir(pb2json_workspace)
    subprocess.run(["powershell", "-Command", "npm install"], capture_output=True)

    os.chdir(path_now)
