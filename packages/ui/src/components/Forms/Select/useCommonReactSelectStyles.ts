import { useMemo } from 'react'
import type { GroupBase, StylesConfig } from 'react-select'

export type PublicCommonReactSelectStylesProps = {
	/**
	 * Use to set z-index of the drop-down menu in portal
	 */
	menuZIndex?: number
}

export type CommonReactSelectStylesProps =
	& PublicCommonReactSelectStylesProps
	& { isInvalid?: boolean }

export const useCommonReactSelectStyles = <Option = unknown, IsMulti extends boolean = boolean, Group extends GroupBase<Option> = GroupBase<Option>>({ isInvalid = false, menuZIndex }: CommonReactSelectStylesProps): StylesConfig<Option, IsMulti, Group> => useMemo(() => ({
	indicatorSeparator: (provided, { isFocused, isDisabled }) => {
		const backgroundColor = isDisabled
			? 'var(--cui-color--lower)'
			: isFocused
				? 'var(--cui-color--low)'
				: 'var(--cui-color--lower)'

		return {
			...provided,
			backgroundColor,
		}
	},
	indicatorsContainer: (provided, { isDisabled }) => {
		const color = isDisabled
			? 'var(--cui-color--low)'
			: 'var(--cui-color)'

		return {
			...provided,
			color,
			margin: 'calc(-1 * var(--cui-control-border-width, 1px)) 0',
			padding: '0 var(--cui-gap)',
		}
	},
	singleValue: (provided, { isDisabled }) => {
		const color = isDisabled
			? 'var(--cui-control-color)'
			: 'var(--cui-color-low)'

		return {
			...provided,
			color,
		}
	},
	multiValue: (provided, { isDisabled }) => {
		const color = isDisabled ? 'var(--cui-color--low)' : 'var(--cui-filled-control-color)'
		const borderColor = isDisabled ? 'var(--cui-color--low)' : 'var(--cui-filled-control-border-color)'
		const backgroundColor = isDisabled ? 'var(--cui-color--lower)' : 'var(--cui-toned-control-background-color)'

		return {
			...provided,
			color,
			borderColor,
			backgroundColor,
		}
	},
	multiValueLabel: (provided, { isDisabled }) => {
		const color = isDisabled ? 'var(--cui-color--high)' : 'var(--cui-filled-control-color)'

		return {
			...provided,
			color,
		}
	},
	multiValueRemove: provided => {
		const color = 'var(--cui-toned-control-color)'
		const backgroundColor = 'var(--cui-toned-control-background-color)'

		// TODO: Indirect, but there seens to be no better way for now
		const isFocusing = provided.backgroundColor

		return {
			...provided,
			color,
			'backgroundColor': isFocusing ? backgroundColor : undefined,
			'opacity': isFocusing ? 1 : 0.5,
			'&:hover': {
				color,
				backgroundColor,
				opacity: 1,
			},
		}
	},
	dropdownIndicator: (provided, { isFocused, isDisabled }) => {
		return {
			...provided,
			'alignSelf': 'stretch',
			'alignItems': 'center',
			'color': isDisabled
				? 'var(--cui-color--low)'
				: isFocused
					? 'var(--cui-color--strong)'
					: 'var(--cui-color--high)',
			'padding': '0 var(--cui-gap)',
			'&:hover': {
				color: 'var(--cui-color--strong)',
			},
		}
	},
	clearIndicator: (provided, { isFocused }) => {
		return {
			...provided,
			'color': isFocused
				? 'var(--cui-color--strong)'
				: 'var(--cui-color--high)',
			'&:hover': {
				color: 'var(--cui-color--strong)',
			},
		}
	},
	control: (provided, { isFocused, isDisabled }) => {
		const backgroundColor = 'var(--cui-filled-background-color)'
		const color = isDisabled
			? 'var(--cui-color--low)'
			: isFocused
				? 'var(--cui-color--strong)'
				: 'var(--cui-color)'

		const borderColor = isInvalid
			? 'rgb(var(--cui-theme-danger-500))'
			: isDisabled
				? 'var(--cui-color--lower)'
				: isFocused
					? 'var(--cui-color--low)'
					: 'var(--cui-color--lower)'

		return {
			...provided,
			backgroundColor,
			borderColor,
			'borderWidth': 'var(--cui-control-border-width, 1px)',
			color,
			'borderRadius': 'var(--cui-control-border-radius)',
			'boxShadow': isFocused ? 'var(--cui-control-focus-ring-box-shadow)' : undefined,
			'minHeight': 'var(--cui-control-height)',
			'&:hover': {
				backgroundColor: 'var(--cui-filled-background-color--highlighted)',
				color: 'var(--cui-color--strong)',
				borderColor: 'var(--cui-color--low)',
			},
		}
	},
	menu: provided => {
		const backgroundColor = 'var(--cui-background-color--above)'
		const border = 'var(--cui-control-border-width, 1px) solid var(--cui-color--lower)'

		return {
			...provided,
			backgroundColor,
			border,
		}
	},
	menuList: provided => {
		return {
			...provided,
			zIndex: menuZIndex ?? 'unset',
		}
	},
	menuPortal: provided => {
		return {
			...provided,
			zIndex: 150,
		}
	},
	option: (provided, { isFocused, isSelected }) => {
		return {
			...provided,
			'backgroundColor': isFocused
				? 'var(--cui-filled-primary-control-background-color--highlighted)'
				: isSelected
					? 'var(--cui-filled-primary-control-background-color)'
					: 'transparent',
			'color': isFocused
				? 'var(--cui-filled-primary-control-color--highlighted)'
				: isSelected
					? 'var(--cui-filled-primary-control-color)'
					: 'var(--cui-color)',
			'&:hover': {
				backgroundColor: 'var(--cui-filled-primary-control-background-color--highlighted)',
				color: 'var(--cui-filled-primary-control-color--highlighted)',
			},
		}
	},
	placeholder: provided => {
		return {
			...provided,
			position: 'absolute',
		}
	},
	valueContainer: provided => {
		return {
			...provided,
			display: 'flex',
		}
	},
}), [isInvalid, menuZIndex])
