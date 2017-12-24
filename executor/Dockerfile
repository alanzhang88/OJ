FROM ubuntu:17.04

LABEL maintainer="alanzhang88@gmail.com"

RUN apt-get update

RUN apt-get install -y build-essential software-properties-common \
  && add-apt-repository ppa:ubuntu-toolchain-r/test \
  && apt-get update \
  && apt-get install -y gcc-7 g++-7 \
  && apt-get install -y default-jre openjdk-8-jdk \
  && apt-get install -y python2.7 \
  && update-alternatives --config java \
  && echo "alias python=python2.7" >> ~/.bash_aliases \
  && echo "alias gcc=gcc-7" >> ~/.bash_aliases \
  && echo "alias g++=g++-7" >> ~/.bash_aliases
