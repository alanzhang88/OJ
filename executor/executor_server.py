from flask import Flask
from flask import request
from flask import jsonify
import docker
import executor_utils as eu

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/exec",methods=["POST"])
def codeExce():
    data = request.get_json()
    #print type(data)
    print "Recv a request to execute the following"
    print str(data["codes"])
    res=""
    langType = str(data["langType"])
    codes = str(data["codes"])
    tmpdir = eu.mk_tmp_dir()
    eu.create_code_file(tmpdir,langType,codes)    
    res=eu.container_run(client,langType,tmpdir)
    eu.rm_tmp_dir(tmpdir)
    return jsonify(output=res)


if __name__ == "__main__":
    client = docker.from_env()
    eu.load_image(client)
    app.run()
