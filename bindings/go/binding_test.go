package tree_sitter_glu_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-glu"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_glu.Language())
	if language == nil {
		t.Errorf("Error loading Glu grammar")
	}
}
