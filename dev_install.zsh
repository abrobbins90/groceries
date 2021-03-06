#!/bin/zsh
# Developer install script.  Or at the very least, a reference of things that should be installed in order for groceries project to work!

os=$(uname)
if [[ "$os" == "Darwin" ]]; then
	package_manager="brew"
elif [[ "$os" == "FreeBSD" ]]; then
	package_manager="pkg"
elif [[ "$os" == "Linux" ]]; then
	package_manager="apt-get"
else
	echo "operating system not recognized."
	return
fi

is_installed () {
	name=$1

	bool=1
	out=$(which "$name")
	if [[ "$out" == "$name not found" ]]
	then
		bool=0
	fi
	echo -n "$bool"
}

# gulp + babel
# see https://stackoverflow.com/questions/41005744/babel-error-couldnt-find-preset-latest-relative-to-directory-when-preset-w#41005814
"$package_manager" install node
npm -v
npm install gulp-cli -g
npm install gulp -D
gulp_deps=(gulp-babel babel-cli babel-preset-es2015 gulp-autoprefixer child_process moment properties-reader)
for gulp_dep in $gulp_deps
do
	npm install "$gulp_dep"
done

# python 3 + libraries
"$package_manager" install python2
"$package_manager" install wget
wget https://bootstrap.pypa.io/get-pip.py
python2 get-pip.py
py_deps=(tornado pytest pymongo git-lint passlib)
for py_dep in $py_deps
do
	pip2 install "$py_dep"
done

# report success (gulp_deps and py_deps not verified here)
dep_names=(node npm gulp babel python3 wget pip)
for dep_name in $dep_names
do
	dep_installed=$(is_installed "$dep_name")
	if [[ "$dep_installed" == "0" ]]
	then
		echo "$dep_name is not installed."
	fi
done
