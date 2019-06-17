# mul
![sample](https://github.com/keiya01/mul/blob/master/mul.gif)

# Description
- mul is tool to search multiple word.
- The search is done asynchronously. 
- Up to three processes are performed asynchronously.
- The way search is scraping search result by inputted multiple word.

# Setup
- get_file: `git clone https://github.com/keiya01/mul.git`
- setup: `yarn && yarn build`
- set_path: `export PATH="your_dir_path/mul/bin:$PATH"`
- usage: `mul -s "search word"`

# How to search
- option: `-s | --search`
- single word: `github`
- multiple words: `"How to use github"`
