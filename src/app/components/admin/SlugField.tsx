'use client'

import React, { useCallback } from 'react'
import type { TextFieldClientComponent } from 'payload'
import { Button, TextInput, useField, useFormFields } from '@payloadcms/ui'
import { slugify } from '@/utilities/slugify'

/**
 * Custom admin field for `slug`: a normal text input with a "Generate" button
 * that fills the slug by slugifying the current `title` value (respects the
 * active admin locale).
 */
export const SlugField: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue, showError } = useField<string>({ path })
  const title = useFormFields(
    ([fields]) => (fields?.title?.value as string | undefined) ?? '',
  )

  const handleGenerate = useCallback(() => {
    const next = slugify(title)
    if (next) setValue(next)
  }, [title, setValue])

  return (
    <TextInput
      path={path}
      label={field?.label}
      required={field?.required}
      value={value ?? ''}
      showError={showError}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      AfterInput={
        <Button
          type="button"
          buttonStyle="secondary"
          size="small"
          onClick={handleGenerate}
          disabled={!title}
        >
          Generate from title
        </Button>
      }
    />
  )
}

export default SlugField
