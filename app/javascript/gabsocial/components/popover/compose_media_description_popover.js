import React from 'react'
import PropTypes from 'prop-types'
import PopoverLayout from './popover_layout'
import Button from '../button'
import Heading from '../heading'
import Text from '../text'
import Textarea from '../textarea'

class ComposeMediaDescriptionPopover extends React.PureComponent {

  state = {
    description: this.props.description,
  }

  handleClick = () => {
    const { onClose, onConfirm, index } = this.props
    const { description } = this.state
    onClose()
    !!onConfirm && onConfirm(index, description)
  }

  handleCancel = () => {
    this.props.onClose()
  }

  handleOnChange = (value) => {
    this.setState({ description: value })
  }

  render() {
    const { isXS } = this.props
    const { description } = this.state

    return (
      <PopoverLayout
        width={400}
        isXS={isXS}
        onClose={this.handleCancel}
      >
        <div className={[_s.d, _s.px15, _s.py15].join(' ')}>

          <Heading size='h1'>Add description</Heading>

          <div className={[_s.d, _s.mt5].join(' ')}>
            <Text color='secondary' className={_s.mb10}>Describe for the visually impaired</Text>

            <Textarea value={description} onChange={this.handleOnChange} />

            <div className={[_s.d, _s.flexRow, _s.mt10, _s.pt10].join(' ')}>
              <Button
                backgroundColor='tertiary'
                color='primary'
                onClick={this.handleCancel}
                className={[_s.mr10, _s.flexGrow1].join(' ')}
              >
                <Text size='medium' weight='bold' align='center' color='inherit'>Cancel</Text>
              </Button>
            
              <Button 
                backgroundColor='brand'
                color='white'
                onClick={this.handleClick}
                className={_s.flexGrow1}
              >
                <Text size='medium' weight='bold' align='center' color='inherit'>Save</Text>
              </Button>
            </div>


          </div>
        </div>
      </PopoverLayout>
    )
  }
}


ComposeMediaDescriptionPopover.propTypes = {
  description: PropTypes.string,
  index: PropTypes.number,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  isXS: PropTypes.bool,
}

export default ComposeMediaDescriptionPopover