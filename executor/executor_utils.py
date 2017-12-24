import docker
import os
import tempfile
import shutil

imageName = "oj-exec"
#client = docker.from_env()

tmpFileName = {"C":"Solution.c","C++":"Solution.cpp","Java":"Solution.java","Python2.7":"Solution.py"}
# compileCmdList = {
#     "C":'/bin/bash -c "gcc Solution.c -o Solution;./Solution"',
#     "C++":'/bin/bash -c "g++ Solution.cpp -o Solution;./Solution"',
#     "Java":'/bin/bash -c "javac Solution.java;java Solution"',
#     "Python2.7":'/bin/bash -c "python Solution.py"'
# }

def load_image(client):
    image = None
    try:
        print "See if image exists"
        image = client.images.get(imageName)
        return image
    except docker.errors.ImageNotFound:
        print "Image not found, we try to build it with Dockerfile"
        image = client.images.build(path="./",tag=imageName)
        return image
    except docker.errors.APIError:
        print "Server has errors"
    except docker.errors.BuildError:
        print "Building has erros"

def mk_tmp_dir():
    if not os.path.isdir("./tmp"):
        os.makedirs("./tmp")
    return tempfile.mkdtemp(dir="./tmp/")

def create_code_file(tmpdir,langType,codes):
    f = open(tmpdir+"/"+tmpFileName[langType],'w')
    f.write(codes)
    f.close()

def rm_tmp_dir(tmpdir):
    shutil.rmtree(tmpdir)

def container_run(client,langType,tmpdir):
    cmd = '/bin/bash -c "./run %s"' % langType
    vol = {
        os.path.abspath(tmpdir) + '/' + tmpFileName[langType] : {
            'bind' : '/root/' + tmpFileName[langType],
            'mode' : 'rw'
        },
        os.getcwd() + '/' + 'run' : {
            'bind' : '/root/run',
            'mode' : 'ro'
        }
    }
    print vol
    print cmd
    try:
        res = client.containers.run(image=imageName,command=cmd,auto_remove=True,stdout=True,stderr=True,volumes=vol,working_dir='/root')
        print "Get from container"
        print res
        return res
    except docker.errors.ContainerError:
        print "Container exits with nonzero and detach is false"
    except docker.errors.APIError:
        print "Server returns an error"

#load_image(client)
#container = container_run(client
