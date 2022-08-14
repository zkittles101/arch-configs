call plug#begin()    "This starts the vim-plug plugin

Plug 'mattn/emmet-vim'           "Emmet web dev plugin
Plug 'vim-airline/vim-airline'   "Mininal powerline 
Plug 'arcticicestudio/nord-vim'  "Nord theme
Plug 'ervandew/supertab'         "An autocomplete tool
Plug 'sedm0784/vim-you-autocorrect'  "Autocorrect tool
call plug#end()       "Closes vim-plug

set number    "Enables Line numbers

colorscheme nord  "Enables Nord theme

let g:user_emmet_leader_key='<C-W>' "Changes the emmet keybinding to CTRL+W+COMMA

let g:airline_powerline_fonts= 1   "Toggles the fancy fonts for powerline

