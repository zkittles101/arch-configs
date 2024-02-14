call plug#begin()    "This starts the vim-plug plugin

Plug 'preservim/nerdtree'
Plug 'nvie/vim-flake8'
Plug 'dense-analysis/ale'
Plug 'mattn/emmet-vim'           "Emmet web dev plugin
Plug 'vim-airline/vim-airline'   "Mininal powerline 
Plug 'arcticicestudio/nord-vim'  "Nord theme
Plug 'davidhalter/jedi-vim'

call plug#end()       "Closes vim-plug

set number    "Enables Line numbers

colorscheme nord  "Enables Nord theme

let g:user_emmet_leader_key='<C-W>' "Changes the emmet keybinding to CTRL+W+COMMA

let g:airline_powerline_fonts= 1   "Toggles the fancy fonts for powerline

syntax on           "Enables synatx higlighting

set t_Co=256        "Enables 256-colors

set foldmethod=indent    "Adds code-folding with indents

set foldlevel=99       "lets us open files without everything being folded

"nnoremap <space> za    " maps a key for code-folding

" KeyBindings for NerdTree
nnoremap <C-v> :NERDTreeFocus<CR>
nnoremap <C-n> :NERDTree<CR>
nnoremap <C-t> :NERDTreeToggle<CR>
nnoremap <C-f> :NERDTreeFind<CR>

au BufNewFile, BufRead *.py  " assignes the properties below for python files
	\ set tabstop=4     "sets tab size
	\ set softtabstop=4
	\ set shiftwidth=4  "sets indet size
	\ set textwidth=99 
	\ set expandtab   "sets tabs to spaces
	\ set autoindent
	\ set fileformat=unix

let g:ale_linters = {'python': ['flake8']}  "assigns flake8 as our python linter
