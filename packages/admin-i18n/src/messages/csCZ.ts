import type { AdminDictionary } from '@contember/admin'

export const csCZ: AdminDictionary = {
	dataGrid: {
		emptyMessage: {
			text: 'Žádné položky.',
		},
		columnFiltering: {
			showMenuButton: {
				text: 'Všechny filtry',
			},
			heading: 'Všechny filtry',
			emptyMessage: {
				text: 'Žádné aktivní filtry.',
			},
			columnColumn: {
				text: 'Sloupec',
			},
			filterColumn: {
				text: 'Filtr',
			},
			addFilterButton: {
				text: 'Přidat filtr',
			},
		},
		columnHiding: {
			showMenuButton: {
				text: 'Sloupce',
			},
			heading: 'Sloupce',
		},
		paging: {
			first: 'První',
			previous: 'Předchozí',
			next: 'Následující',
			last: 'Poslední',

			status: {
				unknownPageTotal: 'Strana {pageNumber}',
				knownPageTotal: 'Strana {pageNumber} z {totalPageCount}',
				itemCount: '({itemCount, plural, =0 {Žádné položky} one {# položka} few {# položky} other {# položek}})',
			},
		},
	},
	dataGirdCells: {
		booleanCell: {
			includeTrue: 'Ano',
			includeFalse: 'Ne',
			includeNull: 'Neznámé',
		},
		dateCell: {
			fromLabel: 'Od',
			toLabel: 'Do',
		},
		textCell: {
			matches: 'Obsahuje',
			doesNotMatch: 'Neobsahuje',
			matchesExactly: 'Přesně odpovídá',
			startsWith: 'Začáná na',
			endsWith: 'Končí na',

			queryPlaceholder: 'Hledaný výraz',

			includeNull: '<strong>Zahrnout</strong> prázdné',
			excludeNull: '<strong>Vynechat</strong> prázdné',
		},
	},
	errorCodes: {
		fieldRequired: 'Vyplňte prosím toto pole.',
	},
	fieldView: {
		boolean: {
			yes: 'Ano',
			no: 'Ne',
		},
		fallback: {
			unknown: 'Neznámé',
			notAvailable: 'Prázdné',
		},
	},
	persistFeedback: {
		successMessage: 'Úspěšně uloženo!',
		errorMessage: 'Při ukládání došlo k chybě. Zkuste to prosím znovu.',
	},
	repeater: {
		addButton: {
			text: 'Přidat další',
		},
		emptyMessage: {
			text: 'Nic tu není. Zkuste přidat novou položku.',
		},
	},
	upload: {
		addButton: {
			text: 'Vyberte soubory',
			subText: 'or nebo je sem přetáhněte',
		},
		fileState: {
			inspectingFile: 'Zkoumám soubor…',
			invalidFile: 'Chybný soubor',
			failedUpload: 'Nahrávání selhalo',
			finalizing: 'Dokončuji…',
		},
	},
}
